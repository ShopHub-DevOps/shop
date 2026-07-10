import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { ARTICLE_REPOSITORY } from '../database/repositories/interfaces/article.repository.interface';

const mockArticle: Article = {
  id: 1,
  name: 'Pencil',
  quantity: 10,
  price: 29.99,
};

const mockRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('ArticlesService', () => {
  let service: ArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: ARTICLE_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated', async () => {
      mockRepository.findAll.mockResolvedValue({ data: [mockArticle], total: 1 });

      const result = await service.findAll(1, 10, '');

      expect(result).toEqual({
        data: [mockArticle],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, '');
    });

    it('search filter applied', async () => {
      const searchTerm = 'laptop';

      mockRepository.findAll.mockResolvedValue({ data: [mockArticle], total: 1 });

      await service.findAll(1, 10, searchTerm);

      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, searchTerm);
    });
  });

  describe('findOne', () => {
    it('should return article by id', async () => {
      mockRepository.findById.mockResolvedValue(mockArticle);
      const result = await service.findOne(1);
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return article', async () => {
      mockRepository.create.mockReturnValue(mockArticle);
      mockRepository.save.mockResolvedValue(mockArticle);
      const result = await service.create({
        name: 'Pencil',
        quantity: 10,
        price: 29.99,
      });
      expect(result).toEqual(mockArticle);
    });
  });

  describe('update', () => {
    it('should update and return article', async () => {
      const updated = { ...mockArticle, quantity: 5 };
      mockRepository.findById
        .mockResolvedValueOnce(mockArticle)
        .mockResolvedValueOnce(updated);
      mockRepository.update.mockResolvedValue(undefined);
      
      const result = await service.update(1, { quantity: 5 });
      expect(result.quantity).toBe(5);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.update(999, { quantity: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete article', async () => {
      mockRepository.findById.mockResolvedValue(mockArticle);
      mockRepository.delete.mockResolvedValue(undefined);
      await expect(service.remove(1)).resolves.not.toThrow();
    });

    it('should throw NotFoundException if article not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
