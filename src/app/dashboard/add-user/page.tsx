'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/app/hooks/useDarkMode';
import { commonStyles } from '@/app/styles/commonStyles';

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function AddUser() {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      // Clear the form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={commonStyles.container(isDark)}>
      <div className="mb-10">
        <h1 className={commonStyles.heading(isDark)}>Add New User</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className={commonStyles.error(isDark)}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Username
            </label>
            <input
              type="text"
              id="username"
              required
              className={commonStyles.input(isDark)}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              className={commonStyles.input(isDark)}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              className={commonStyles.input(isDark)}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              className={commonStyles.input(isDark)}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={commonStyles.button(isDark, isLoading)}
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h2 className={commonStyles.subheading(isDark)}>User List</h2>
        {isLoadingUsers ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className={commonStyles.table.container(isDark)}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={commonStyles.table.header(isDark)}>
                <tr>
                  <th className={commonStyles.table.headerCell(isDark)}>
                    Username
                  </th>
                  <th className={commonStyles.table.headerCell(isDark)}>
                    Email
                  </th>
                  <th className={commonStyles.table.headerCell(isDark)}>
                    Created At
                  </th>
                  <th className={commonStyles.table.headerCell(isDark)}>
                    Updated At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className={commonStyles.table.row(isDark)}>
                    <td className={commonStyles.table.cell(isDark)}>
                      {user.username}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {user.email}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 