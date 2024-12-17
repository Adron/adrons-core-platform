'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/hooks/useDarkMode';
import { commonStyles } from '@/app/styles/commonStyles';

type TenantData = {
  name: string;
  details: string | null;
};

interface TenantUser {
  user: {
    id: string;
    username: string;
    email: string;
  };
  role?: string;
}

export default function EditTenant({ params }: { params: { id: string } }) {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const [formData, setFormData] = useState<TenantData>({
    name: '',
    details: '',
  });
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  // Fetch tenant users
  const fetchTenantUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/tenants/${params.id}/users`);
      if (!response.ok) throw new Error('Failed to fetch tenant users');
      const data = await response.json();
      setTenantUsers(data);
    } catch (err) {
      console.error('Error fetching tenant users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [params.id]);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch(`/api/tenants/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tenant');
        }
        const data = await response.json();
        setFormData({
          name: data.name,
          details: data.details || '',
        });
        await fetchTenantUsers(); // Fetch users after tenant data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tenant');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenant();
  }, [params.id, fetchTenantUsers]);

  const handleRemoveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/tenants/${params.id}/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove user');
      }

      await fetchTenantUsers(); // Refresh the user list
    } catch (err) {
      console.error('Error removing user:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tenants/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update tenant');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to update tenant');
    } finally {
      setIsLoading(false);
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
        <h1 className={commonStyles.heading(isDark)}>Edit Tenant</h1>
        
        {error && (
          <div className={commonStyles.error(isDark)}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Tenant Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={commonStyles.input(isDark)}
              required
            />
          </div>

          <div>
            <label htmlFor="details" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Details
            </label>
            <textarea
              id="details"
              value={formData.details || ''}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className={commonStyles.input(isDark)}
              rows={3}
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
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className={commonStyles.subheading(isDark)}>Tenant Users</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push(`/dashboard/edit-tenant/${params.id}/manage-roles`)}
              className={commonStyles.button(isDark, false)}
            >
              Manage Tenant Roles
            </button>
            <button
              onClick={() => router.push(`/dashboard/edit-tenant/${params.id}/add-users`)}
              className={commonStyles.button(isDark, false)}
            >
              Manage Users
            </button>
          </div>
        </div>

        {isLoadingUsers ? (
          <div className={`text-center py-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
            Loading users...
          </div>
        ) : (
          <div className={commonStyles.table.container(isDark)}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={commonStyles.table.header(isDark)}>
                <tr>
                  <th className={commonStyles.table.headerCell(isDark)}>Username</th>
                  <th className={commonStyles.table.headerCell(isDark)}>Email</th>
                  <th className={commonStyles.table.headerCell(isDark)}>Role</th>
                  <th className={commonStyles.table.headerCell(isDark)}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {tenantUsers.map((tenantUser) => (
                  <tr key={tenantUser.user.id} className={commonStyles.table.row(isDark)}>
                    <td className={commonStyles.table.cell(isDark)}>
                      {tenantUser.user.username}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {tenantUser.user.email}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {tenantUser.role || 'Member'}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      <button
                        onClick={() => handleRemoveUser(tenantUser.user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {tenantUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className={`${commonStyles.table.cell(isDark)} text-center`}
                    >
                      No users assigned to this tenant
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 