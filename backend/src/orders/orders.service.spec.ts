import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';

const mockOrder: Order = {
  id: 1,
  status: OrderStatus.PENDING,
  createdAt: new Date('2026-01-01'),
  walletAddress: '0x123abc',
  txHash: null,
  items: [],
};

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockOrder], 1]),
};

const mockRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  findOne: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockOrder], 1]);
      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: [mockOrder],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });

    it('should filter by status', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockOrder], 1]);
      await service.findAll(1, 10, OrderStatus.PENDING);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.status = :status',
        { status: OrderStatus.PENDING },
      );
    });

    it('should filter by date range', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockOrder], 1]);
      await service.findAll(1, 10, undefined, '2026-01-01', '2026-12-31');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockOrder);
      const result = await service.findOne(1);
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
