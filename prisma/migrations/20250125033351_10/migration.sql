/*
  Warnings:

  - Added the required column `typeControl` to the `Control` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeControl" AS ENUM ('ENTRADA', 'SALIDA');

-- AlterTable
ALTER TABLE "Control" ADD COLUMN     "typeControl" "TypeControl" NOT NULL;
