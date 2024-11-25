import { prisma } from './prisma';
import { hash } from 'bcryptjs';

export type CreateTenantInput = {
  name: string;
  details?: string;
};

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
  tenantId?: string;
  roleNames?: string[];
};

export type CreateRoleInput = {
  name: string;
  details?: string;
};

export const tenantOperations = {
  // Create a new tenant
  async createTenant(data: CreateTenantInput) {
    return prisma.tenant.create({
      data: {
        name: data.name,
        details: data.details,
      },
    });
  },

  // Get tenant with its users
  async getTenantWithUsers(tenantId: string) {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                userRoles: {
                  include: {
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  // Update tenant
  async updateTenant(tenantId: string, data: Partial<CreateTenantInput>) {
    return prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
  },
};

export const userOperations = {
  // Create a new user with optional tenant and roles
  async createUser(data: CreateUserInput) {
    const hashedPassword = await hash(data.password, 12);

    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        ...(data.tenantId && {
          tenants: {
            create: {
              tenant: {
                connect: { id: data.tenantId },
              },
            },
          },
        }),
        ...(data.roleNames && {
          userRoles: {
            create: data.roleNames.map(roleName => ({
              name: `${data.username}-${roleName}`,
              role: {
                connect: { name: roleName },
              },
            })),
          },
        }),
      },
      include: {
        tenants: {
          include: {
            tenant: true,
          },
        },
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  },

  // Get user with their roles and tenants
  async getUserDetails(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenants: {
          include: {
            tenant: true,
          },
        },
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  },

  // Add user to tenant
  async addUserToTenant(userId: string, tenantId: string) {
    return prisma.tenantUser.create({
      data: {
        user: { connect: { id: userId } },
        tenant: { connect: { id: tenantId } },
      },
    });
  },

  // Assign role to user
  async assignRoleToUser(userId: string, roleName: string) {
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { username: true }
    });

    if (!user) throw new Error('User not found');

    return prisma.userRole.create({
      data: {
        name: `${user.username}-${roleName}`,
        user: { connect: { id: userId } },
        role: { connect: { name: roleName } },
      },
    });
  },
};

export const roleOperations = {
  // Create a new role
  async createRole(data: CreateRoleInput) {
    return prisma.role.create({
      data: {
        name: data.name,
        details: data.details,
      },
    });
  },

  // Get role with its users
  async getRoleWithUsers(roleId: string) {
    return prisma.role.findUnique({
      where: { id: roleId },
      include: {
        userRoles: {
          include: {
            user: true,
          },
        },
      },
    });
  },
};

// Query utilities for common operations
export const queryUtils = {
  // Get all users in a tenant
  async getUsersInTenant(tenantId: string) {
    return prisma.tenantUser.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });
  },

  // Get all users with a specific role
  async getUsersByRole(roleName: string) {
    return prisma.userRole.findMany({
      where: {
        role: { name: roleName },
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
  },

  // Get all tenants a user belongs to
  async getUserTenants(userId: string) {
    return prisma.tenantUser.findMany({
      where: { userId },
      include: {
        tenant: true,
      },
    });
  },

  // Get all roles a user has
  async getUserRoles(userId: string) {
    return prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });
  },
};