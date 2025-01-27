-- CreateEnum
CREATE TYPE "HolidaysType" AS ENUM ('PERMANENTE', 'TRANSITORIO');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateTable
CREATE TABLE "Holidays" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT,
    "type" "HolidaysType" NOT NULL,

    CONSTRAINT "Holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Days" (
    "id" SERIAL NOT NULL,
    "Day" "DayType" NOT NULL,
    "isExcluded" BOOLEAN NOT NULL,

    CONSTRAINT "Days_pkey" PRIMARY KEY ("id")
);
