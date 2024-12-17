import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/app/lib/auth';

// GET /api/tenants/[id]/roles - Get all roles for a tenant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const tenantRoles = await prisma.tenantUserRole.findMany({
      where: {
        tenantId: params.id,
      },
      select: {
        id: true,
        name: true,
        details: true,
      },
    });

    return NextResponse.json(tenantRoles);
  } catch (error) {
    console.error('Error fetching tenant roles:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/tenants/[id]/roles - Create a new role for a tenant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, details } = body;

    if (!name) {
      return new NextResponse('Role name is required', { status: 400 });
    }

    const newRole = await prisma.tenantUserRole.create({
      data: {
        name,
        details,
        tenantId: params.id,
      },
      select: {
        id: true,
        name: true,
        details: true,
      },
    });

    return NextResponse.json(newRole);
  } catch (error) {
    console.error('Error creating tenant role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 