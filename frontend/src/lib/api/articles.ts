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

export const createArticle = async (data: Partial<Article>) => {
  const response = await api.post<Article>('/articles', data);
  return response.data;
};

export const updateArticle = async (id: number, data: Partial<Article>) => {
  const response = await api.patch<Article>(`/articles/${id}`, data);
  return response.data;
};

export const deleteArticle = async (id: number) => {
  await api.delete(`/articles/${id}`);
};