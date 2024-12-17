'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/hooks/useDarkMode';
import { commonStyles } from '@/app/styles/commonStyles';

interface UserData {
  username: string;
  email: string;
  tenants: {
    tenant: {
      id: string;
      name: string;
    };
    roles: {
      id: string;
      name: string;
    }[];
    tenantRoles: {
      id: string;
      name: string;
    }[];
  }[];
}

interface Role {
  id: string;
  name: string;
}

interface Tenant {
  id: string;
  name: string;
  roles: Role[];
}

export default function EditUser({ params }: { params: { id: string } }) {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const [formData, setFormData] = useState<UserData>({
    username: '',
    email: '',
    tenants: [],
  });
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, rolesResponse, tenantsResponse] = await Promise.all([
          fetch(`/api/users/${params.id}`),
          fetch('/api/roles'),
          fetch('/api/tenants'),
        ]);

        if (!userResponse.ok || !rolesResponse.ok || !tenantsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [userData, rolesData, tenantsData] = await Promise.all([
          userResponse.json(),
          rolesResponse.json(),
          tenantsResponse.json(),
        ]);

        setFormData(userData);
        setAvailableRoles(rolesData);
        setAvailableTenants(tenantsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      router.push('/dashboard/add-user');
      router.refresh();
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = async (roleId: string) => {
    try {
      const response = await fetch(`/api/users/${params.id}/roles/${roleId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle role');
      }

      // Refresh user data
      const userResponse = await fetch(`/api/users/${params.id}`);
      const userData = await userResponse.json();
      setFormData(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle role');
    }
  };

  const handleTenantRoleToggle = async (tenantId: string, roleId: string) => {
    try {
      const response = await fetch(`/api/users/${params.id}/tenants/${tenantId}/roles/${roleId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle tenant role');
      }

      // Refresh user data
      const userResponse = await fetch(`/api/users/${params.id}`);
      const userData = await userResponse.json();
      setFormData(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle tenant role');
    }
  };

  if (isLoading) {
    return (
      <div className={`text-center py-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
        Loading...
      </div>
    );
  }

  return (
    <div className={commonStyles.container(isDark)}>
      <div className="mb-10">
        <h1 className={commonStyles.heading(isDark)}>Edit User</h1>
        
        {error && (
          <div className={commonStyles.error(isDark)}>
            {error}
          </div>
        )}

        {/* Basic Info Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          <div>
            <label htmlFor="username" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={commonStyles.input(isDark)}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={commonStyles.input(isDark)}
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className={commonStyles.button(isDark, isLoading)}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className={`flex-1 py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors
                ${isDark 
                  ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${isDark ? 'focus:ring-offset-gray-900' : ''}`}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Global Roles Section */}
        <div className="mb-8">
          <h2 className={commonStyles.subheading(isDark)}>Global Roles</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {availableRoles.map((role) => (
              <div
                key={role.id}
                className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'border-gray-700 bg-gray-800' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>
                    {role.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRoleToggle(role.id)}
                    className={`px-3 py-1 rounded-md ${
                      formData.tenants.some(t => t.roles.some(r => r.id === role.id))
                        ? isDark
                          ? 'bg-red-900 text-red-200 hover:bg-red-800'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                        : isDark
                          ? 'bg-green-900 text-green-200 hover:bg-green-800'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {formData.tenants.some(t => t.roles.some(r => r.id === role.id))
                      ? 'Remove'
                      : 'Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tenant Roles Section */}
        <div>
          <h2 className={commonStyles.subheading(isDark)}>Tenant Roles</h2>
          <div className="space-y-6 mt-4">
            {availableTenants.map((tenant) => (
              <div
                key={tenant.id}
                className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'border-gray-700 bg-gray-800' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className={`text-lg font-medium mb-4 ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {tenant.name}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {(tenant.roles || []).map((role) => (
                    <div
                      key={role.id}
                      className={`p-3 rounded border ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700' 
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>
                          {role.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTenantRoleToggle(tenant.id, role.id)}
                          className={`px-3 py-1 rounded-md ${
                            formData.tenants
                              .find(t => t.tenant.id === tenant.id)
                              ?.tenantRoles.some(r => r.id === role.id)
                                ? isDark
                                  ? 'bg-red-900 text-red-200 hover:bg-red-800'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                                : isDark
                                  ? 'bg-green-900 text-green-200 hover:bg-green-800'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {formData.tenants
                            .find(t => t.tenant.id === tenant.id)
                            ?.tenantRoles.some(r => r.id === role.id)
                              ? 'Remove'
                              : 'Add'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 