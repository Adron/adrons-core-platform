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
  // Helper function to get or create a default tenant
  async getDefaultTenantId() {
    // First try to find the default tenant
    let defaultTenant = await prisma.tenant.findFirst({
      where: {
        name: 'Default Tenant'
      }
    });

    // If it doesn't exist, create it
    if (!defaultTenant) {
      defaultTenant = await prisma.tenant.create({
        data: {
          name: 'Default Tenant',
          details: 'Default tenant for system-wide roles'
        }
      });
    }

    return defaultTenant.id;
  },

  // Create a new user with optional tenant and roles
  async createUser(data: CreateUserInput) {
    try {
      const hashedPassword = await hash(data.password, 12);

      // First, create the user without roles
      const user = await prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          password: hashedPassword,
        },
      });

      // If a tenant is specified, first get or create the default user role for that tenant
      if (data.tenantId) {
        // Get or create the default USER role for the tenant
        const defaultRole = await prisma.tenantUserRole.upsert({
          where: {
            name_tenantId: {
              name: 'USER',
              tenantId: data.tenantId
            }
          },
          create: {
            name: 'USER',
            tenant: {
              connect: { id: data.tenantId }
            }
          },
          update: {}
        });

        // Create the tenant role assignment
        await prisma.tenantUserRoleAssignment.create({
          data: {
            user: {
              connect: { id: user.id }
            },
            tenant: {
              connect: { id: data.tenantId }
            },
            tenantUserRole: {
              connect: { id: defaultRole.id }
            }
          }
        });
      }

      // If role names are specified, create the user roles
      if (data.roleNames && data.roleNames.length > 0) {
        for (const roleName of data.roleNames) {
          await prisma.userRole.create({
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
                  name: 'USER',
                  tenant: {
                    connect: { id: data.tenantId || await userOperations.getDefaultTenantId() }
                  }
                }
              }
            }
          });
        }
      }

      // Fetch and return the complete user data with all relations
      const createdUser = await prisma.user.findUnique({
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

    // Get or create the default tenant user role
    const defaultTenant = await this.getDefaultTenantId();
    const defaultRole = await prisma.tenantUserRole.upsert({
      where: {
        name_tenantId: {
          name: 'USER',
          tenantId: defaultTenant
        }
      },
      create: {
        name: 'USER',
        tenant: {
          connect: { id: defaultTenant }
        }
      },
      update: {}
    });

    return prisma.userRole.create({
      data: {
        name: `${user.username}-${roleName}`,
        user: { connect: { id: userId } },
        role: { connect: { name: roleName } },
        tenantUserRole: { connect: { id: defaultRole.id } }
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