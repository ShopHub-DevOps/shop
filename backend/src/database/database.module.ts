import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RedisService } from './redis.service';

import { ARTICLE_REPOSITORY } from './repositories/interfaces/article.repository.interface';
import { ORDER_REPOSITORY } from './repositories/interfaces/order.repository.interface';
import { USER_REPOSITORY } from './repositories/interfaces/user.repository.interface';

import { ArticlePostgresRepository } from './repositories/postgres/article.postgres.repository';
import { OrderPostgresRepository } from './repositories/postgres/order.postgres.repository';
import { UserPostgresRepository } from './repositories/postgres/user.postgres.repository';

import { ArticleRedisRepository } from './repositories/redis/article.redis.repository';
import { OrderRedisRepository } from './repositories/redis/order.redis.repository';
import { UserRedisRepository } from './repositories/redis/user.redis.repository';

import { Article } from '../articles/entities/article.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    const isLightTier = process.env.SHOP_DB_TIER === 'light';

    const providers: any[] = [];
    const imports: any[] = [];
    const exports: any[] = [ARTICLE_REPOSITORY, ORDER_REPOSITORY, USER_REPOSITORY];

    if (isLightTier) {
      providers.push(
        RedisService,
        {
          provide: ARTICLE_REPOSITORY,
          useClass: ArticleRedisRepository,
        },
        {
          provide: ORDER_REPOSITORY,
          useClass: OrderRedisRepository,
        },
        {
          provide: USER_REPOSITORY,
          useClass: UserRedisRepository,
        },
      );
    } else {
      imports.push(
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            type: 'postgres',
            url: config.get<string>('DATABASE_URL'),
            autoLoadEntities: true,
            synchronize: false,
            migrationsRun: true,
            migrations: [__dirname + '/../migrations/*{.ts,.js}'],
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Article, Order, User, OrderItem]),
      );
      providers.push(
        {
          provide: ARTICLE_REPOSITORY,
          useClass: ArticlePostgresRepository,
        },
        {
          provide: ORDER_REPOSITORY,
          useClass: OrderPostgresRepository,
        },
        {
          provide: USER_REPOSITORY,
          useClass: UserPostgresRepository,
        },
      );
    }

    return {
      module: DatabaseModule,
      imports,
      providers,
      exports,
      global: true, // Make repositories available globally so we don't need to import DatabaseModule in every feature module
    };
  }
}
