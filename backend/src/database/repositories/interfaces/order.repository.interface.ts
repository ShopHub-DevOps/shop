import { Order, OrderStatus } from '../../../orders/entities/order.entity';

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

export interface IOrderRepository {
  findAll(
    page: number,
    limit: number,
    status?: OrderStatus,
    from?: string,
    to?: string,
  ): Promise<{ data: Order[]; total: number }>;
  findOneWithItems(id: number): Promise<Order | null>;
  create(data: Partial<Order>): Order;
  save(order: Order): Promise<Order>;
}
