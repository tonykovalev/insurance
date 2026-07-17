-- DropForeignKey
ALTER TABLE "Policy" DROP CONSTRAINT "Policy_subtypeId_fkey";

-- AlterTable
ALTER TABLE "Policy" ALTER COLUMN "subtypeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_subtypeId_fkey" FOREIGN KEY ("subtypeId") REFERENCES "PolicySubtype"("id") ON DELETE SET NULL ON UPDATE CASCADE;
