import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order, OrderStatus } from './entities/order.entity';
import { ethers } from 'ethers';
import { CreateOrderDto } from './dto/create-order.dto';
import { Article } from '../articles/entities/article.entity';
import { ORDER_REPOSITORY } from '../database/repositories/interfaces/order.repository.interface';
import type { IOrderRepository } from '../database/repositories/interfaces/order.repository.interface';
import { ARTICLE_REPOSITORY } from '../database/repositories/interfaces/article.repository.interface';
import type { IArticleRepository } from '../database/repositories/interfaces/article.repository.interface';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepository: IArticleRepository,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
    from?: string,
    to?: string,
  ) {
    const { data, total } = await this.orderRepository.findAll(page, limit, status, from, to);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOneWithItems(id);
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async createCheckout(dto: CreateOrderDto): Promise<Order> {
    const itemsToSave: {
      article: Article;
      quantity: number;
      priceAtPurchase: number;
      articleName: string;
    }[] = [];

    for (const item of dto.items) {
      const article = await this.articleRepository.findById(item.articleId);
      if (!article)
        throw new NotFoundException(`Article #${item.articleId} not found`);
      if (article.quantity < item.quantity) {
        throw new BadRequestException(`Not enough stock for ${article.name}`);
      }

      itemsToSave.push({
        article,
        quantity: item.quantity,
        priceAtPurchase: article.price,
        articleName: article.name,
      });
    }

    try {
      const rpcUrl =
        process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
      const chainId = parseInt(process.env.CHAIN_ID || '11155111', 10);

      const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
      const tx = await provider.getTransaction(dto.txHash);

      if (!tx)
        throw new BadRequestException('Transaction not found on blockchain');

      const expectedWallet = (
        process.env.SHOP_WALLET_ADDRESS || ''
      ).toLowerCase();
      if (tx.to?.toLowerCase() !== expectedWallet) {
        throw new BadRequestException(
          'Transaction sent to the wrong wallet address',
        );
      }

      const receipt = await provider.getTransactionReceipt(dto.txHash);
      if (!receipt || receipt.status !== 1) {
        throw new BadRequestException('Transaction is pending or has failed');
      }
    } catch (error) {
      throw new BadRequestException('Failed to verify blockchain transaction');
    }

    const order = this.orderRepository.create({
      status: OrderStatus.CONFIRMED,
      walletAddress: dto.walletAddress,
      txHash: dto.txHash,
      items: itemsToSave as any,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const item of itemsToSave) {
      item.article.quantity -= item.quantity;
      await this.articleRepository.save(item.article);
    }

    return savedOrder;
  }
}
