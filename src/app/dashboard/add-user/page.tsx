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
  tenants: {
    tenant: {
      id: string;
      name: string;
    };
    roles: {
      name: string;
    }[];
    tenantRoles: {
      name: string;
    }[];
  }[];
}

interface DeleteModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDark: boolean;
}

function DeleteConfirmationModal({ user, isOpen, onClose, onConfirm, isDark }: DeleteModalProps) {
  const [confirmUsername, setConfirmUsername] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmUsername === user.username) {
      onConfirm();
    } else {
      setError('Username does not match');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Delete User
        </h3>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          This action cannot be undone. Please type <span className="font-semibold">{user.username}</span> to confirm.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              className={commonStyles.input(isDark)}
              placeholder="Enter username to confirm"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Delete User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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

  const handleEdit = (userId: string) => {
    router.push(`/dashboard/edit-user/${userId}`);
  };

  const handleDelete = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchUsers(); // Refresh the list
      setUserToDelete(null); // Close the modal
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
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
                    Tenants & Roles
                  </th>
                  <th className={commonStyles.table.headerCell(isDark)}>
                    Created At
                  </th>
                  <th className={commonStyles.table.headerCell(isDark)}>
                    Updated At
                  </th>
                  <th className={commonStyles.table.headerCell(isDark)}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {users.map((user) => (
                  <tr key={user.id} className={commonStyles.table.row(isDark)}>
                    <td className={commonStyles.table.cell(isDark)}>
                      {user.username}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {user.email}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      <div className="space-y-2">
                        {user.tenants.map((tenantInfo) => (
                          <div 
                            key={tenantInfo.tenant.id} 
                            className={`p-2 rounded ${
                              isDark ? 'bg-gray-700' : 'bg-gray-100'
                            }`}
                          >
                            <div className={`font-medium ${
                              isDark ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              {tenantInfo.tenant.name}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tenantInfo.roles.map((role, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs px-2 py-1 rounded ${
                                    isDark 
                                      ? 'bg-blue-900 text-blue-200' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {role.name}
                                </span>
                              ))}
                              {tenantInfo.tenantRoles.map((role, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs px-2 py-1 rounded ${
                                    isDark 
                                      ? 'bg-green-900 text-green-200' 
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {role.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </td>
                    <td className={`${commonStyles.table.cell(isDark)} space-x-2`}>
                      <button
                        onClick={() => handleEdit(user.id)}
                        className={`px-3 py-1 rounded-md ${
                          isDark 
                            ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' 
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setUserToDelete(user)}
                        className={`px-3 py-1 rounded-md ${
                          isDark 
                            ? 'bg-red-900 text-red-200 hover:bg-red-800' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {userToDelete && (
        <DeleteConfirmationModal
          user={userToDelete}
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={() => handleDelete(userToDelete)}
          isDark={isDark}
        />
      )}
    </div>
  );
} 