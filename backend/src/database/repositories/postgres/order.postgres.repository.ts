import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../../orders/entities/order.entity';
import { IOrderRepository } from '../interfaces/order.repository.interface';

@Injectable()
export class OrderPostgresRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    status?: OrderStatus,
    from?: string,
    to?: string,
  ): Promise<{ data: Order[]; total: number }> {
    const qb = this.repository
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

    qb.take(limit).skip((page - 1) * limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  findOneWithItems(id: number): Promise<Order | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['items', 'items.article'],
    });
  }

  create(data: Partial<Order>): Order {
    return this.repository.create(data);
  }

  save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }
}
