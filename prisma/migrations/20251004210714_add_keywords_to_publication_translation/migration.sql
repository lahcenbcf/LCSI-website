/*
  Warnings:

  - You are about to drop the column `technologies` on the `team_translations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "publication_translations" ADD COLUMN     "keywords" TEXT[];

-- AlterTable
ALTER TABLE "team_translations" DROP COLUMN "technologies";
