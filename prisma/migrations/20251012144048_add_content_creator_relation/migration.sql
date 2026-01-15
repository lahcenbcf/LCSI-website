-- AlterTable
ALTER TABLE "contents" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
