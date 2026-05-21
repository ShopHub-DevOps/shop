import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
//import { OrderItem } from './entities/order-item.entity';
import { ethers } from 'ethers';
import { CreateOrderDto } from './dto/create-order.dto';
import { Article } from '../articles/entities/article.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
    from?: string,
    to?: string,
  ) {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.article', 'article')
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    if (from) {
      qb.andWhere('order.createdAt >= :from', { from: new Date(from) });
    }

    if (to) {
      qb.andWhere('order.createdAt <= :to', { to: new Date(to) });
    }

    // Paginacija
    qb.take(limit).skip((page - 1) * limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.article'],
    });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async createCheckout(dto: CreateOrderDto): Promise<Order> {
    //const itemsToSave = [];
    //const itemsToSave: Partial<OrderItem>[] = [];
    const itemsToSave: {
      article: Article;
      quantity: number;
      priceAtPurchase: number;
      articleName: string;
    }[] = [];

    for (const item of dto.items) {
      const article = await this.articleRepository.findOne({
        where: { id: item.articleId },
      });
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

    // 2. Blockchain validation (Sepolia Testnet)
    try {
      //const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
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
      items: itemsToSave,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const item of itemsToSave) {
      item.article.quantity -= item.quantity;
      await this.articleRepository.save(item.article);
    }

    return savedOrder;
  }
}
