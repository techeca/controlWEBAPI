/*
  Warnings:

  - Added the required column `title` to the `Routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Routes" ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "secondName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "surName" TEXT NOT NULL DEFAULT '';
