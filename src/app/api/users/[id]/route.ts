import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
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

    // Delete the user
    await prisma.user.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

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

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        userRoles: {
          select: {
            id: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tenants: {
          select: {
            tenant: {
              select: {
                id: true,
                name: true,
                roles: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            // Get role assignments through TenantUserRoleAssignment
            user: {
              select: {
                tenantRoleAssignments: {
                  select: {
                    tenantUserRole: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Transform the data to match our interface
    const transformedUser = {
      ...user,
      tenants: user.tenants.map(t => ({
        tenant: t.tenant,
        roles: user.userRoles.map(ur => ({
          id: ur.role.id,
          name: ur.role.name,
        })),
        tenantRoles: t.user.tenantRoleAssignments.map(tra => ({
          id: tra.tenantUserRole.id,
          name: tra.tenantUserRole.name,
        })),
      })),
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const data = await request.json();

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        AND: [
          {
            OR: [
              { username: data.username },
              { email: data.email }
            ]
          },
          {
            NOT: {
              id: params.id
            }
          }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        username: data.username,
        email: data.email,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 