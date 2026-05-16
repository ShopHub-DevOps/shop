import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';

const mockArticle: Article = {
  id: 1,
  name: 'Pencil',
  quantity: 10,
  price: 29.99,
};

const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ArticlesService', () => {
  let service: ArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all articles', async () => {
      mockRepository.find.mockResolvedValue([mockArticle]);
      const result = await service.findAll();
      expect(result).toEqual([mockArticle]);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return article by id', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockArticle);
      const result = await service.findOne(1);
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
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
      mockRepository.findOneBy.mockResolvedValue(mockArticle);
      mockRepository.update.mockResolvedValue(undefined);
      const updated = { ...mockArticle, quantity: 5 };
      mockRepository.findOneBy
        .mockResolvedValueOnce(mockArticle)
        .mockResolvedValueOnce(updated);
      const result = await service.update(1, { quantity: 5 });
      expect(result.quantity).toBe(5);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.update(999, { quantity: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete article', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockArticle);
      mockRepository.delete.mockResolvedValue(undefined);
      await expect(service.remove(1)).resolves.not.toThrow();
    });

    it('should throw NotFoundException if article not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
