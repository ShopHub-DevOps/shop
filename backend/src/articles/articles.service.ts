import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  //findAll(): Promise<Article[]> {
  //return this.articleRepository.find();
  //}

  async findAll(page: number, limit: number, search: string) {
    const [data, total] = await this.articleRepository.findAndCount({
      where: search ? { name: ILike(`%${search}%`) } : {},
      take: limit,
      skip: (page - 1) * limit,
      order: { id: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOneBy({ id });
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
