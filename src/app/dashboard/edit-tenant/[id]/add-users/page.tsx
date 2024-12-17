'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/hooks/useDarkMode';
import { commonStyles } from '@/app/styles/commonStyles';

interface User {
  id: string;
  username: string;
  email: string;
  isMember: boolean;
}

export default function ManageUsers({ params }: { params: { id: string } }) {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all users and their membership status
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [allUsersResponse, tenantUsersResponse] = await Promise.all([
          fetch('/api/users'),
          fetch(`/api/tenants/${params.id}/users`)
        ]);

        if (!allUsersResponse.ok || !tenantUsersResponse.ok) {
          throw new Error('Failed to fetch users');
        }

        const allUsers = await allUsersResponse.json();
        const tenantUsers = await tenantUsersResponse.json();
        const tenantUserIds = new Set(tenantUsers.map((tu: any) => tu.user.id));

        // Combine the data
        const combinedUsers = allUsers.map((user: any) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          isMember: tenantUserIds.has(user.id)
        }));

        setUsers(combinedUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [params.id]);

  const toggleUserMembership = async (userId: string, isMember: boolean) => {
    try {
      const response = await fetch(`/api/tenants/${params.id}/users/${userId}`, {
        method: isMember ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error(isMember ? 'Failed to remove user' : 'Failed to add user');
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isMember: !isMember }
          : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user membership');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className={`text-center py-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
        Loading users...
      </div>
    );
  }

  return (
    <div className={commonStyles.container(isDark)}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className={commonStyles.heading(isDark)}>Manage Users</h1>
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

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={commonStyles.input(isDark)}
        />
      </div>

      <div className={commonStyles.table.container(isDark)}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={commonStyles.table.header(isDark)}>
            <tr>
              <th className={commonStyles.table.headerCell(isDark)}>Username</th>
              <th className={commonStyles.table.headerCell(isDark)}>Email</th>
              <th className={commonStyles.table.headerCell(isDark)}>Status</th>
              <th className={commonStyles.table.headerCell(isDark)}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={commonStyles.table.row(isDark)}>
                <td className={commonStyles.table.cell(isDark)}>{user.username}</td>
                <td className={commonStyles.table.cell(isDark)}>{user.email}</td>
                <td className={commonStyles.table.cell(isDark)}>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isMember
                      ? isDark 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-green-100 text-green-800'
                      : isDark
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isMember ? 'Member' : 'Not Member'}
                  </span>
                </td>
                <td className={commonStyles.table.cell(isDark)}>
                  <button
                    onClick={() => toggleUserMembership(user.id, user.isMember)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      user.isMember
                        ? isDark 
                          ? 'bg-red-900 text-red-200 hover:bg-red-800' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                        : isDark
                          ? 'bg-green-900 text-green-200 hover:bg-green-800'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {user.isMember ? 'Remove' : 'Add'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 