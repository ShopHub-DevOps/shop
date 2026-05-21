import { api } from '../axios';

export interface Article {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface PaginatedResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getArticles = async (page = 1, limit = 10, search = '') => {
  const response = await api.get<PaginatedResponse>('/articles', {
    params: { page, limit, search },
  });
  return response.data;
};

export const getArticleById = async (id: number) => {
  const response = await api.get<Article>(`/articles/${id}`);
  return response.data;
};