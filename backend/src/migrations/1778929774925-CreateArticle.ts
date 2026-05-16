import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArticle1778929774925 implements MigrationInterface {
    name = 'CreateArticle1778929774925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "article" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "quantity" integer NOT NULL, "price" numeric(10,2) NOT NULL, CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "article"`);
    }

}
