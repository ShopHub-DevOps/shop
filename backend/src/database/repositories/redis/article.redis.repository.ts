import { Injectable } from '@nestjs/common';
import { Article } from '../../../articles/entities/article.entity';
import { IArticleRepository } from '../interfaces/article.repository.interface';
import { RedisService } from '../../redis.service';

@Injectable()
export class ArticleRedisRepository implements IArticleRepository {
  private readonly prefix = 'article:';

  constructor(private readonly redisService: RedisService) {}

  async findAll(page: number, limit: number, search: string): Promise<{ data: Article[]; total: number }> {
    const client = this.redisService.getClient();
    const keys = await client.keys(`${this.prefix}*`);
    const articles: Article[] = [];

    for (const key of keys) {
      const data = await client.get(key);
      if (data) {
        articles.push(JSON.parse(data));
      }
    }

    let filtered = articles;
    if (search) {
      filtered = filtered.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    }

    filtered.sort((a, b) => b.id - a.id); // DESC order

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return { data: paginatedData, total };
  }

  async findById(id: number): Promise<Article | null> {
    const client = this.redisService.getClient();
    const data = await client.get(`${this.prefix}${id}`);
    return data ? JSON.parse(data) : null;
  }

  create(data: Partial<Article>): Article {
    // create doesn't save to DB yet in TypeORM, it just instantiates
    const article = new Article();
    Object.assign(article, data);
    return article;
  }

  async save(article: Article): Promise<Article> {
    const client = this.redisService.getClient();
    if (!article.id) {
      article.id = await client.incr('seq:article:id');
    }
    await client.set(`${this.prefix}${article.id}`, JSON.stringify(article));
    return article;
  }

  async update(id: number, data: Partial<Article>): Promise<void> {
    const article = await this.findById(id);
    if (article) {
      Object.assign(article, data);
      await this.save(article);
    }
  }

  async delete(id: number): Promise<void> {
    const client = this.redisService.getClient();
    await client.del(`${this.prefix}${id}`);
  }
}
