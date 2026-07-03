import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserNullableFields1783076800000 implements MigrationInterface {
  name = 'UpdateUserNullableFields1783076800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "walletAddress" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_walletAddress" UNIQUE ("walletAddress")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_walletAddress"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "walletAddress"`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
  }
}
