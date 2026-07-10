import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Article } from './entities/article.entity';
import { ARTICLE_REPOSITORY } from '../database/repositories/interfaces/article.repository.interface';
import type { IArticleRepository } from '../database/repositories/interfaces/article.repository.interface';

@Injectable()
export class ArticlesService {
  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepository: IArticleRepository,
  ) {}

  async findAll(page: number, limit: number, search: string) {
    const { data, total } = await this.articleRepository.findAll(page, limit, search);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findById(id);
    if (!article) throw new NotFoundException(`Article #${id} not found`);
    return article;
  }

  create(data: Partial<Article>): Promise<Article> {
    const article = this.articleRepository.create(data);
    return this.articleRepository.save(article);
  }

  async update(id: number, data: Partial<Article>): Promise<Article> {
    await this.findOne(id);
    await this.articleRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.articleRepository.delete(id);
  }
}
