import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1616547714340 implements MigrationInterface {
    name = 'migration1616547714340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "order" integer NOT NULL, "status" varchar NOT NULL, "categoryId" integer, CONSTRAINT "FK_14973cece7b39a867065f6c3fda" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_card"("id", "name", "description", "created_at", "updated_at", "order", "status", "categoryId") SELECT "id", "name", "Description", "created_at", "updated_at", "order", "status", "categoryId" FROM "card"`);
        await queryRunner.query(`DROP TABLE "card"`);
        await queryRunner.query(`ALTER TABLE "temporary_card" RENAME TO "card"`);
        await queryRunner.query(`CREATE TABLE "temporary_card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "order" integer NOT NULL, "status" varchar NOT NULL, "categoryId" integer, CONSTRAINT "FK_14973cece7b39a867065f6c3fda" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_card"("id", "name", "description", "created_at", "updated_at", "order", "status", "categoryId") SELECT "id", "name", "description", "created_at", "updated_at", "order", "status", "categoryId" FROM "card"`);
        await queryRunner.query(`DROP TABLE "card"`);
        await queryRunner.query(`ALTER TABLE "temporary_card" RENAME TO "card"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card" RENAME TO "temporary_card"`);
        await queryRunner.query(`CREATE TABLE "card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "order" integer NOT NULL, "status" varchar NOT NULL, "categoryId" integer, CONSTRAINT "FK_14973cece7b39a867065f6c3fda" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "card"("id", "name", "description", "created_at", "updated_at", "order", "status", "categoryId") SELECT "id", "name", "description", "created_at", "updated_at", "order", "status", "categoryId" FROM "temporary_card"`);
        await queryRunner.query(`DROP TABLE "temporary_card"`);
        await queryRunner.query(`ALTER TABLE "card" RENAME TO "temporary_card"`);
        await queryRunner.query(`CREATE TABLE "card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "Description" varchar NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "order" integer NOT NULL, "status" varchar NOT NULL, "categoryId" integer, CONSTRAINT "FK_14973cece7b39a867065f6c3fda" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "card"("id", "name", "Description", "created_at", "updated_at", "order", "status", "categoryId") SELECT "id", "name", "description", "created_at", "updated_at", "order", "status", "categoryId" FROM "temporary_card"`);
        await queryRunner.query(`DROP TABLE "temporary_card"`);
    }

}
