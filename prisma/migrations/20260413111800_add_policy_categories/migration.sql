/*
  Warnings:

  - You are about to drop the column `type` on the `Policy` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtypeId` to the `Policy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Policy" DROP COLUMN "type",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "subtypeId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "PolicyType";

-- CreateTable
CREATE TABLE "PolicyCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicySubtype" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "PolicySubtype_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PolicyCategory_name_key" ON "PolicyCategory"("name");

-- AddForeignKey
ALTER TABLE "PolicySubtype" ADD CONSTRAINT "PolicySubtype_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PolicyCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PolicyCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_subtypeId_fkey" FOREIGN KEY ("subtypeId") REFERENCES "PolicySubtype"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
