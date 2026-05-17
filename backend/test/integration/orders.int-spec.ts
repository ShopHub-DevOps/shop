import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { User, UserRole } from '../../src/users/entities/user.entity';

describe('OrdersController (integration)', () => {
  let app: INestApplication<App>;
  let container: StartedPostgreSqlContainer;
  let adminToken: string;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();

    process.env.JWT_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: container.getConnectionUri(),
          entities: [Order, OrderItem, Article, User],
          synchronize: true,
        }),
        OrdersModule,
        ArticlesModule,
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'admin123' });

    const userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    await userRepo.update(
      { email: 'admin@test.com' },
      { role: UserRole.ADMIN },
    );

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    adminToken = (loginRes.body as { accessToken: string }).accessToken;
  }, 60000);

  afterAll(async () => {
    await app.close();
    await container.stop();
  });

  it('GET /orders should return empty array', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it('GET /orders/:id should return 404 for non-existent order', async () => {
    await request(app.getHttpServer())
      .get('/orders/999')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('GET /orders without token should return 401', async () => {
    await request(app.getHttpServer()).get('/orders').expect(401);
  });
});
