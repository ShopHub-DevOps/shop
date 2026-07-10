import { Injectable } from '@nestjs/common';
import { Order, OrderStatus } from '../../../orders/entities/order.entity';
import { IOrderRepository } from '../interfaces/order.repository.interface';
import { RedisService } from '../../redis.service';

@Injectable()
export class OrderRedisRepository implements IOrderRepository {
  private readonly prefix = 'order:';

  constructor(private readonly redisService: RedisService) {}

  async findAll(
    page: number,
    limit: number,
    status?: OrderStatus,
    from?: string,
    to?: string,
  ): Promise<{ data: Order[]; total: number }> {
    const client = this.redisService.getClient();
    const keys = await client.keys(`${this.prefix}*`);
    const orders: Order[] = [];

    for (const key of keys) {
      const data = await client.get(key);
      if (data) {
        orders.push(JSON.parse(data));
      }
    }

    let filtered = orders;
    if (status) {
      filtered = filtered.filter(o => o.status === status);
    }
    if (from) {
      const fromDate = new Date(from).getTime();
      filtered = filtered.filter(o => new Date(o.createdAt).getTime() >= fromDate);
    }
    if (to) {
      const toDate = new Date(to).getTime();
      filtered = filtered.filter(o => new Date(o.createdAt).getTime() <= toDate);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return { data: paginatedData, total };
  }

  async findOneWithItems(id: number): Promise<Order | null> {
    const client = this.redisService.getClient();
    const data = await client.get(`${this.prefix}${id}`);
    return data ? JSON.parse(data) : null;
  }

  create(data: Partial<Order>): Order {
    const order = new Order();
    Object.assign(order, data);
    if (!order.createdAt) {
      order.createdAt = new Date();
    }
    return order;
  }

  async save(order: Order): Promise<Order> {
    const client = this.redisService.getClient();
    if (!order.id) {
      order.id = await client.incr('seq:order:id');
    }
    await client.set(`${this.prefix}${order.id}`, JSON.stringify(order));
    return order;
  }
}
