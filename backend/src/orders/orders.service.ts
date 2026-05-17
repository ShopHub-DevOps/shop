import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(
    status?: OrderStatus,
    from?: string,
    to?: string,
  ): Promise<Order[]> {
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

    return qb.getMany();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.article'],
    });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }
}
