import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tenantUsers = await prisma.tenantUser.findMany({
      where: {
        tenantId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(tenantUsers);
  } catch (error) {
    console.error('Error fetching tenant users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant users' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the specific TenantUser record first
    const tenantUser = await prisma.tenantUser.findFirst({
      where: {
        tenantId: params.id,
        userId: params.userId,
      },
    });

    if (!tenantUser) {
      return NextResponse.json(
        { error: 'User not found in tenant' },
        { status: 404 }
      );
    }

    // Delete using the id
    await prisma.tenantUser.delete({
      where: {
        id: tenantUser.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing tenant user:', error);
    return NextResponse.json(
      { error: 'Failed to remove user from tenant' },
      { status: 500 }
    );
  }
} 