/*
  Warnings:

  - You are about to drop the column `department` on the `member_translations` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `member_translations` table. All the data in the column will be lost.
  - Added the required column `firstname` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "member_translations" DROP COLUMN "department",
DROP COLUMN "name",
ADD COLUMN     "institution" TEXT;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "firstname" TEXT NOT NULL,
ADD COLUMN     "lastname" TEXT NOT NULL;
