-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "Routes" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "type" "RouteType" NOT NULL,

    CONSTRAINT "Routes_pkey" PRIMARY KEY ("id")
);
