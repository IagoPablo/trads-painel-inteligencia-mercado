-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('STATE', 'MUNICIPALITY');

-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('POPULATION', 'HOUSEHOLD_INCOME', 'GDP', 'GDP_PER_CAPITA', 'AGE_GROUP');

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "ibgeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketIndicator" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "indicator" "IndicatorType" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,
    "referencePeriod" INTEGER NOT NULL,
    "dimension" TEXT,
    "source" TEXT NOT NULL,
    "ibgeTable" TEXT,
    "ibgeVariable" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_ibgeCode_key" ON "Location"("ibgeCode");

-- CreateIndex
CREATE INDEX "Location_type_idx" ON "Location"("type");

-- CreateIndex
CREATE INDEX "Location_parentId_idx" ON "Location"("parentId");

-- CreateIndex
CREATE INDEX "MarketIndicator_locationId_idx" ON "MarketIndicator"("locationId");

-- CreateIndex
CREATE INDEX "MarketIndicator_indicator_idx" ON "MarketIndicator"("indicator");

-- CreateIndex
CREATE INDEX "MarketIndicator_referencePeriod_idx" ON "MarketIndicator"("referencePeriod");

-- CreateIndex
CREATE UNIQUE INDEX "MarketIndicator_locationId_indicator_referencePeriod_dimens_key" ON "MarketIndicator"("locationId", "indicator", "referencePeriod", "dimension");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketIndicator" ADD CONSTRAINT "MarketIndicator_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
