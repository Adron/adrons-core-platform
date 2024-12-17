import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string; tenantId: string; roleId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the tenant role assignment already exists
    const existingAssignment = await prisma.tenantUserRoleAssignment.findFirst({
      where: {
        userId: params.id,
        tenantId: params.tenantId,
        tenantUserRoleId: params.roleId,
      },
    });

    if (existingAssignment) {
      // Remove the role if it exists
      await prisma.tenantUserRoleAssignment.delete({
        where: {
          id: existingAssignment.id,
        },
      });
    } else {
      // Add the role if it doesn't exist
      await prisma.tenantUserRoleAssignment.create({
        data: {
          userId: params.id,
          tenantId: params.tenantId,
          tenantUserRoleId: params.roleId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling tenant role:', error);
    return NextResponse.json(
      { error: 'Failed to toggle tenant role' },
      { status: 500 }
    );
  }
} 