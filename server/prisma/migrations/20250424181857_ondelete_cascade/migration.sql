-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_planId_fkey";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
