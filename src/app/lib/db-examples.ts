import { 
    tenantOperations, 
    userOperations, 
    roleOperations, 
    queryUtils 
  } from './db-utils';
  
  async function exampleUsage() {
    try {
      // Create a new tenant
      const tenant = await tenantOperations.createTenant({
        name: 'Example Corp',
        details: 'Our first tenant'
      });
  
      // Create some roles
      const adminRole = await roleOperations.createRole({
        name: 'admin',
        details: 'Administrator role'
      });
  
      const userRole = await roleOperations.createRole({
        name: 'user',
        details: 'Standard user role'
      });
  
      // Create a user with tenant and roles
      const newUser = await userOperations.createUser({
        username: 'john.doe',
        email: 'john@example.com',
        password: 'securePassword123',
        tenantId: tenant.id,
        roleNames: ['admin', 'user']
      });
  
      if (!newUser) {
        throw new Error('Failed to create user');
      }
  
      // Get all users in a tenant
      const tenantUsers = await queryUtils.getUsersInTenant(tenant.id);
  
      // Get all admin users
      const adminUsers = await queryUtils.getUsersByRole('admin');
  
      // Get user's tenants
      const userTenants = await queryUtils.getUserTenants(newUser.id);
  
      // Get user's roles
      const userRoles = await queryUtils.getUserRoles(newUser.id);
  
      // Add user to another tenant
      const anotherTenant = await tenantOperations.createTenant({
        name: 'Another Corp'
      });
      await userOperations.addUserToTenant(newUser.id, anotherTenant.id);
  
      // Assign additional role to user
      await userOperations.assignRoleToUser(newUser.id, 'user');
  
    } catch (error) {
      console.error('Error in example usage:', error);
    }
  }