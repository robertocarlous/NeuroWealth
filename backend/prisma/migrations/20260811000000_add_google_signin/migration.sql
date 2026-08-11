-- AlterTable
ALTER TABLE "users" ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "walletAddress" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "walletAddress" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
