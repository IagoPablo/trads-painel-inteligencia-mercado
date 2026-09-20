-- CreateTable
CREATE TABLE "AnsMunicipalData" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "referencePeriod" INTEGER NOT NULL,
    "beneficiariesMedical" INTEGER NOT NULL,
    "beneficiariesDental" INTEGER NOT NULL,
    "beneficiariesTotal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnsMunicipalData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnsMunicipalData_locationId_idx" ON "AnsMunicipalData"("locationId");

-- CreateIndex
CREATE INDEX "AnsMunicipalData_referencePeriod_idx" ON "AnsMunicipalData"("referencePeriod");

-- CreateIndex
CREATE UNIQUE INDEX "AnsMunicipalData_locationId_referencePeriod_key" ON "AnsMunicipalData"("locationId", "referencePeriod");

-- AddForeignKey
ALTER TABLE "AnsMunicipalData" ADD CONSTRAINT "AnsMunicipalData_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
