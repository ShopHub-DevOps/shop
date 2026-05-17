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
  getMany: jest.fn().mockResolvedValue([mockOrder]),
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
    it('should return all orders', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockOrder]);
      const result = await service.findAll();
      expect(result).toEqual([mockOrder]);
    });

    it('should filter by status', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockOrder]);
      await service.findAll(OrderStatus.PENDING);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.status = :status',
        { status: OrderStatus.PENDING },
      );
    });

    it('should filter by date range', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockOrder]);
      await service.findAll(undefined, '2026-01-01', '2026-12-31');
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
