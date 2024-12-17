import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string; roleId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the role assignment already exists
    const existingRole = await prisma.userRole.findFirst({
      where: {
        userId: params.id,
        roleId: params.roleId,
      },
    });

    if (existingRole) {
      // Remove the role if it exists
      await prisma.userRole.delete({
        where: {
          id: existingRole.id,
        },
      });
    } else {
      // Get the role details first
      const role = await prisma.role.findUnique({
        where: { id: params.roleId },
      });

      if (!role) {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        );
      }

      // Create a TenantUserRole first
      const tenantUserRole = await prisma.tenantUserRole.create({
        data: {
          name: role.name,
          tenantId: session.user.id, // Using the current user's ID as tenant for global roles
          details: role.details,
        },
      });

      // Add the role with the tenantUserRoleId
      await prisma.userRole.create({
        data: {
          userId: params.id,
          roleId: params.roleId,
          name: role.name,
          tenantUserRoleId: tenantUserRole.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling role:', error);
    return NextResponse.json(
      { error: 'Failed to toggle role' },
      { status: 500 }
    );
  }
} 