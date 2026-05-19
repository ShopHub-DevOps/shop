import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { User } from '../../src/users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { ArticlesModule } from '../../src/articles/articles.module';

describe('AuthController (integration)', () => {
  let app: INestApplication<App>;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();

    process.env.JWT_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: container.getConnectionUri(),
          entities: [User],
          synchronize: true,
        }),
        UsersModule,
        AuthModule,
        JwtModule,
        PassportModule,
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

  it('POST /auth/register should create customer', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'customer@shop.com', password: 'pass123' })
      .expect(201);

    expect(res.body.email).toBe('customer@shop.com');
    expect(res.body.role).toBe('customer');
  });

  it('POST /auth/login should return token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@shop.com', password: 'pass123' })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
  });

  it('POST /auth/login should return 401 for wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@shop.com', password: 'wrong' })
      .expect(401);
  });

  it('POST /auth/login should return 401 for unknown user', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'unknown@shop.com', password: 'pass' })
      .expect(401);
  });
});
