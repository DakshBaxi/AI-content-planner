/*
  Warnings:

  - You are about to drop the column `stripeSubscriptionId` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "stripeSubscriptionId";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "generationLimit" SET DEFAULT 5;
