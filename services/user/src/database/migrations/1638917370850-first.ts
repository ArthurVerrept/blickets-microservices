import {MigrationInterface, QueryRunner} from "typeorm";

export class first1638917370850 implements MigrationInterface {
    name = 'first1638917370850'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "picture" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "PK_bebc9158e480b949565b4dc7a82"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "brand_rating"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "brand_rating" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "product_quality"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "product_quality" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "product_quality"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "product_quality" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "brand_rating"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "brand_rating" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "PK_bebc9158e480b949565b4dc7a82"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "picture"`);
    }

}
