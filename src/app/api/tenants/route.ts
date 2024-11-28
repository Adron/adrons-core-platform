import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userTenants = await prisma.tenantUser.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        tenant: true,
      },
      orderBy: {
        created: 'desc'
      }
    });

    return NextResponse.json(userTenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    console.log('Session:', session);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User:', session.user);

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Create the tenant and add the current user as admin in a transaction
    const result = await prisma.$transaction(async (prismaTransaction) => {
      // Create the tenant
      const tenant = await prismaTransaction.tenant.create({
        data: {
          name,
          details: description,
        },
      });

      // Try to find user by ID first, then fall back to email
      const user = await prismaTransaction.user.findUnique({
        where: {
          email: session.user.email
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create the user-tenant relationship
      await prismaTransaction.tenantUser.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
        },
      });

      return tenant;
    });

    return NextResponse.json(result);
  } catch (error) {
    // Log the full error
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create tenant' },
      { status: 500 }
    );
  }
}