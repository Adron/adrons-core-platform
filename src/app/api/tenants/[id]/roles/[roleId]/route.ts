import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/app/lib/auth';

// DELETE /api/tenants/[id]/roles/[roleId] - Delete a specific role from a tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; roleId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // First, remove all user assignments for this role
    await prisma.tenantUserRoleAssignment.deleteMany({
      where: {
        tenantUserRoleId: params.roleId,
      },
    });

    // Then delete the role itself
    await prisma.tenantUserRole.delete({
      where: {
        id: params.roleId,
        tenantId: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting tenant role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 