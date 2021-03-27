import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1616811346701 implements MigrationInterface {
    name = 'migration1616811346701'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "order" integer NOT NULL DEFAULT (999999))`);
        await queryRunner.query(`INSERT INTO "temporary_category"("id", "name", "order") SELECT "id", "name", "order" FROM "category"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`ALTER TABLE "temporary_category" RENAME TO "category"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" RENAME TO "temporary_category"`);
        await queryRunner.query(`CREATE TABLE "category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "order" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "category"("id", "name", "order") SELECT "id", "name", "order" FROM "temporary_category"`);
        await queryRunner.query(`DROP TABLE "temporary_category"`);
    }

}
