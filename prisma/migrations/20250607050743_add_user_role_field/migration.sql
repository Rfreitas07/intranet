-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PUBLIC');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PUBLIC';
