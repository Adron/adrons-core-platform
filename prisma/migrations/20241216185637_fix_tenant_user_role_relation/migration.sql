/*
  Warnings:

  - Added the required column `tenantUserRoleId` to the `UserRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "tenantUserRoleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TenantUserRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "details" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "TenantUserRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantUserRole_name_tenantId_key" ON "TenantUserRole"("name", "tenantId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_tenantUserRoleId_fkey" FOREIGN KEY ("tenantUserRoleId") REFERENCES "TenantUserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserRole" ADD CONSTRAINT "TenantUserRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
