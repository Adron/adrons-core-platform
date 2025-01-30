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
  // Helper function to create a tenant and assign owner role
  async createTenantWithOwner(userId: string, tenantName: string, details?: string) {
    return prisma.$transaction(async (tx) => {
      // Create the tenant
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          details: details,
        },
      });

      // Create the owner role for this tenant
      const ownerRole = await tx.tenantUserRole.create({
        data: {
          name: 'Owner',
          details: 'Full access to tenant and all resources',
          tenantId: tenant.id,
        },
      });

      // Create the user-tenant relationship
      await tx.tenantUser.create({
        data: {
          userId: userId,
          tenantId: tenant.id,
        },
      });

      // Assign the owner role to the user
      await tx.tenantUserRoleAssignment.create({
        data: {
          userId: userId,
          tenantId: tenant.id,
          tenantUserRoleId: ownerRole.id,
        },
      });

      return tenant;
    });
  },

  // Create a new user with optional tenant and roles
  async createUser(data: CreateUserInput) {
    try {
      const hashedPassword = await hash(data.password, 12);

      // Create everything in a transaction
      return await prisma.$transaction(async (tx) => {
        // First, create the user
        const user = await tx.user.create({
          data: {
            username: data.username,
            email: data.email,
            password: hashedPassword,
          },
        });

        // Create a default tenant for this user if no tenant is specified
        const tenantId = data.tenantId || (await this.createTenantWithOwner(
          user.id,
          `${data.username}'s Tenant`,
          'Default tenant for user'
        )).id;

        // If role names are specified, create the user roles
        if (data.roleNames && data.roleNames.length > 0) {
          for (const roleName of data.roleNames) {
            await tx.userRole.create({
              data: {
                name: `${data.username}-${roleName}`,
                user: {
                  connect: { id: user.id }
                },
                role: {
                  connect: { name: roleName }
                },
                tenantUserRole: {
                  create: {
                    name: roleName,
                    tenant: {
                      connect: { id: tenantId }
                    }
                  }
                }
              }
            });
          }
        }

        // Fetch and return the complete user data with all relations
        const createdUser = await tx.user.findUnique({
          where: { id: user.id },
          include: {
            userRoles: {
              include: {
                role: true,
                tenantUserRole: true
              }
            },
            tenantRoleAssignments: {
              include: {
                tenant: true,
                tenantUserRole: true
              }
            }
          }
        });

        if (!createdUser) {
          throw new Error('Failed to fetch created user');
        }

        return createdUser;
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
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
        tenantUserRole: {
          create: {
            name: roleName,
            tenant: {
              connect: { id: await this.createTenantWithOwner(userId, `${user.username}'s Tenant`).then(t => t.id) }
            }
          }
        }
      }
    });
  }
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