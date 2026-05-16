import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import { App } from 'supertest/types';
import { ArticlesModule } from '../../src/articles/articles.module';
import { Article } from '../../src/articles/entities/article.entity';

describe('ArticlesController (integration)', () => {
  let app: INestApplication<App>;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: container.getConnectionUri(),
          entities: [Article],
          synchronize: true,
        }),
        ArticlesModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app.close();
    await container.stop();
  });

  it('POST /articles should create article', async () => {
    const res = await request(app.getHttpServer())
      .post('/articles')
      .send({ name: 'Pencil', quantity: 10, price: 29.99 })
      .expect(201);

    expect(res.body.name).toBe('Pencil');
    expect(res.body.quantity).toBe(10);
  });

  it('GET /articles should return all articles', async () => {
    const res = await request(app.getHttpServer()).get('/articles').expect(200);

    expect(res.body).toHaveLength(1);
  });

  it('GET /articles/:id should return one article', async () => {
    const res = await request(app.getHttpServer())
      .get('/articles/1')
      .expect(200);

    expect(res.body.name).toBe('Pencil');
  });

  it('PATCH /articles/:id should update article', async () => {
    const res = await request(app.getHttpServer())
      .patch('/articles/1')
      .send({ quantity: 5 })
      .expect(200);

    expect(res.body.quantity).toBe(5);
  });

  it('DELETE /articles/:id should delete article', async () => {
    await request(app.getHttpServer()).delete('/articles/1').expect(200);
  });

  it('GET /articles/:id should return 404 after delete', async () => {
    await request(app.getHttpServer()).get('/articles/1').expect(404);
  });
});
