-- CreateTable
CREATE TABLE "TenantUserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tenantUserRoleId" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "details" TEXT,

    CONSTRAINT "TenantUserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantUserRoleAssignment_userId_tenantId_tenantUserRoleId_key" ON "TenantUserRoleAssignment"("userId", "tenantId", "tenantUserRoleId");

-- AddForeignKey
ALTER TABLE "TenantUserRoleAssignment" ADD CONSTRAINT "TenantUserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserRoleAssignment" ADD CONSTRAINT "TenantUserRoleAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserRoleAssignment" ADD CONSTRAINT "TenantUserRoleAssignment_tenantUserRoleId_fkey" FOREIGN KEY ("tenantUserRoleId") REFERENCES "TenantUserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
