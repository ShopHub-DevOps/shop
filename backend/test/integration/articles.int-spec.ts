import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule } from '@nestjs/config';
import { ArticlesModule } from '../../src/articles/articles.module';
import { Article } from '../../src/articles/entities/article.entity';
import { AuthModule } from '../../src/auth/auth.module';
import { User, UserRole } from '../../src/users/entities/user.entity';
import { UsersModule } from '../../src/users/users.module';

describe('ArticlesController (integration)', () => {
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
          entities: [Article, User],
          synchronize: true,
        }),
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

    adminToken = loginRes.body.accessToken;
  }, 60000);

  afterAll(async () => {
    await app.close();
    await container.stop();
  });

  it('POST /articles should create article', async () => {
    const res = await request(app.getHttpServer())
      .post('/articles')
      .set('Authorization', `Bearer ${adminToken}`)
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

  it('POST /articles without token should return 401', async () => {
    await request(app.getHttpServer())
      .post('/articles')
      .send({ name: 'Test', quantity: 1, price: 9.99 })
      .expect(401);
  });

  it('PATCH /articles/:id should update article', async () => {
    const res = await request(app.getHttpServer())
      .patch('/articles/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 })
      .expect(200);

    expect(res.body.quantity).toBe(5);
  });

  it('DELETE /articles/:id should delete article', async () => {
    await request(app.getHttpServer())
      .delete('/articles/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('GET /articles/:id should return 404 after delete', async () => {
    await request(app.getHttpServer()).get('/articles/1').expect(404);
  });
});
