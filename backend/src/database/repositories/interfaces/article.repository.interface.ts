import { Article } from '../../../articles/entities/article.entity';

export const ARTICLE_REPOSITORY = 'ARTICLE_REPOSITORY';

export interface IArticleRepository {
  findAll(page: number, limit: number, search: string): Promise<{ data: Article[]; total: number }>;
  findById(id: number): Promise<Article | null>;
  create(data: Partial<Article>): Article;
  save(article: Article): Promise<Article>;
  update(id: number, data: Partial<Article>): Promise<void>;
  delete(id: number): Promise<void>;
}
