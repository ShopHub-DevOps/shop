import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';
import { Article } from '../articles/entities/article.entity';
import { ORDER_REPOSITORY } from '../database/repositories/interfaces/order.repository.interface';
import { ARTICLE_REPOSITORY } from '../database/repositories/interfaces/article.repository.interface';

const mockOrder: Order = {
  id: 1,
  status: OrderStatus.PENDING,
  createdAt: new Date('2026-01-01'),
  walletAddress: '0x123abc',
  txHash: null,
  items: [],
};

const mockOrderRepository = {
  findAll: jest.fn(),
  findOneWithItems: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockArticleRepository = {
  findById: jest.fn(),
  save: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: ORDER_REPOSITORY,
          useValue: mockOrderRepository,
        },
        {
          provide: ARTICLE_REPOSITORY,
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      mockOrderRepository.findAll.mockResolvedValue({ data: [mockOrder], total: 1 });
      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: [mockOrder],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(mockOrderRepository.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined);
    });

    it('should filter by status', async () => {
      mockOrderRepository.findAll.mockResolvedValue({ data: [mockOrder], total: 1 });
      await service.findAll(1, 10, OrderStatus.PENDING);

      expect(mockOrderRepository.findAll).toHaveBeenCalledWith(1, 10, OrderStatus.PENDING, undefined, undefined);
    });

    it('should filter by date range', async () => {
      mockOrderRepository.findAll.mockResolvedValue({ data: [mockOrder], total: 1 });
      await service.findAll(1, 10, undefined, '2026-01-01', '2026-12-31');

      expect(mockOrderRepository.findAll).toHaveBeenCalledWith(1, 10, undefined, '2026-01-01', '2026-12-31');
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      mockOrderRepository.findOneWithItems.mockResolvedValue(mockOrder);
      const result = await service.findOne(1);
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOneWithItems.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
