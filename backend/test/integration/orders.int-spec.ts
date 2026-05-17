import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import { App } from 'supertest/types';
import { OrdersModule } from '../../src/orders/orders.module';
import { ArticlesModule } from '../../src/articles/articles.module';
import { Order } from '../../src/orders/entities/order.entity';
import { OrderItem } from '../../src/orders/entities/order-item.entity';
import { Article } from '../../src/articles/entities/article.entity';

describe('OrdersController (integration)', () => {
  let app: INestApplication<App>;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: container.getConnectionUri(),
          entities: [Order, OrderItem, Article],
          synchronize: true,
        }),
        OrdersModule,
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

  it('GET /orders should return empty array', async () => {
    const res = await request(app.getHttpServer()).get('/orders').expect(200);

    expect(res.body).toEqual([]);
  });

  it('GET /orders/:id should return 404 for non-existent order', async () => {
    await request(app.getHttpServer()).get('/orders/999').expect(404);
  });
});
