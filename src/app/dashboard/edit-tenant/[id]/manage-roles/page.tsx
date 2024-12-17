'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/hooks/useDarkMode';
import { commonStyles } from '@/app/styles/commonStyles';

interface Role {
  id: string;
  name: string;
  details?: string;
}

export default function ManageRoles({ params }: { params: { id: string } }) {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newRole, setNewRole] = useState({ name: '', details: '' });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`/api/tenants/${params.id}/roles`);
        if (!response.ok) throw new Error('Failed to fetch roles');
        const data = await response.json();
        setRoles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch roles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/tenants/${params.id}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRole),
      });

      if (!response.ok) throw new Error('Failed to create role');

      const createdRole = await response.json();
      setRoles([...roles, createdRole]);
      setNewRole({ name: '', details: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
    }
  };

  const handleDelete = async (roleId: string) => {
    try {
      const response = await fetch(`/api/tenants/${params.id}/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete role');

      setRoles(roles.filter(role => role.id !== roleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    }
  };

  if (isLoading) {
    return (
      <div className={`text-center py-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
        Loading roles...
      </div>
    );
  }

  return (
    <div className={commonStyles.container(isDark)}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className={commonStyles.heading(isDark)}>Manage Tenant Roles</h1>
        <button
          onClick={() => router.back()}
          className={`px-4 py-2 rounded-md ${
            isDark 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Back
        </button>
      </div>

      {error && (
        <div className={commonStyles.error(isDark)}>
          {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className={commonStyles.subheading(isDark)}>Add New Role</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Role Name
            </label>
            <input
              type="text"
              id="name"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
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
              value={newRole.details}
              onChange={(e) => setNewRole({ ...newRole, details: e.target.value })}
              className={commonStyles.input(isDark)}
              rows={3}
            />
          </div>
          <button
            type="submit"
            className={commonStyles.button(isDark, false)}
          >
            Add Role
          </button>
        </form>
      </div>

      <div>
        <h2 className={commonStyles.subheading(isDark)}>Existing Roles</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`p-4 rounded-lg border ${
                isDark 
                  ? 'border-gray-700 bg-gray-800' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {role.name}
                  </h3>
                  {role.details && (
                    <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {role.details}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(role.id)}
                  className={`px-2 py-1 rounded-md text-sm ${
                    isDark 
                      ? 'bg-red-900 text-red-200 hover:bg-red-800' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 