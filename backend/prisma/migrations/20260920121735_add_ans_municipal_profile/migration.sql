-- CreateTable
CREATE TABLE "AnsMunicipalProfile" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "referencePeriod" INTEGER NOT NULL,
    "sex" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "beneficiariesMedical" INTEGER NOT NULL,
    "beneficiariesDental" INTEGER NOT NULL,
    "beneficiariesTotal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnsMunicipalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnsMunicipalProfile_locationId_idx" ON "AnsMunicipalProfile"("locationId");

-- CreateIndex
CREATE INDEX "AnsMunicipalProfile_referencePeriod_idx" ON "AnsMunicipalProfile"("referencePeriod");

-- CreateIndex
CREATE INDEX "AnsMunicipalProfile_sex_idx" ON "AnsMunicipalProfile"("sex");

-- CreateIndex
CREATE INDEX "AnsMunicipalProfile_ageGroup_idx" ON "AnsMunicipalProfile"("ageGroup");

-- CreateIndex
CREATE UNIQUE INDEX "AnsMunicipalProfile_locationId_referencePeriod_sex_ageGroup_key" ON "AnsMunicipalProfile"("locationId", "referencePeriod", "sex", "ageGroup");

-- AddForeignKey
ALTER TABLE "AnsMunicipalProfile" ADD CONSTRAINT "AnsMunicipalProfile_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
