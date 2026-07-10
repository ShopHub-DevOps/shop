import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Article } from '../../../articles/entities/article.entity';
import { IArticleRepository } from '../interfaces/article.repository.interface';

@Injectable()
export class ArticlePostgresRepository implements IArticleRepository {
  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
  ) {}

  async findAll(page: number, limit: number, search: string): Promise<{ data: Article[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: search ? { name: ILike(`%${search}%`) } : {},
      take: limit,
      skip: (page - 1) * limit,
      order: { id: 'DESC' },
    });
    return { data, total };
  }

  findById(id: number): Promise<Article | null> {
    return this.repository.findOneBy({ id });
  }

  create(data: Partial<Article>): Article {
    return this.repository.create(data);
  }

  save(article: Article): Promise<Article> {
    return this.repository.save(article);
  }

  async update(id: number, data: Partial<Article>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
