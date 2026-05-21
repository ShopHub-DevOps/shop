import { api } from '../axios';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface OrderItem {
  id: number;
  articleName: string;
  priceAtPurchase: number;
  quantity: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  createdAt: string;
  walletAddress: string | null;
  txHash: string | null;
  items: OrderItem[];
}

export interface PaginatedOrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getOrders = async (page = 1, limit = 10, status?: string, from?: string, to?: string) => {
  const params: Record<string, string | number> = { page, limit };
  if (status) params.status = status;
  if (from) params.from = from;
  if (to) params.to = to;

  const response = await api.get<PaginatedOrdersResponse>('/orders', { params });
  return response.data;
};

export const getOrderById = async (id: number) => {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
};