'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

type UserTenant = {
  tenant: {
    id: string;
    name: string;
    details: string | null;
  };
  role?: string;
};

export default function Settings() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [tenants, setTenants] = useState<UserTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('/api/tenants');
        if (!response.ok) {
          throw new Error('Failed to fetch tenants');
        }
        const data = await response.json();
        setTenants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tenants');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  if (!session) {
    return <div className="text-gray-900 dark:text-white">Please sign in to view settings.</div>;
  }

  if (loading) {
    return <div className="text-gray-900 dark:text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">User Settings</h1>
      
      {/* Theme Settings Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Theme Settings</h2>
        <div className="flex flex-wrap gap-4">
          {(['light', 'dark', 'system'] as const).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${theme === themeOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)} Mode
            </button>
          ))}
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <p className="mt-1 text-gray-900 dark:text-white">{session.user?.username}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <p className="mt-1 text-gray-900 dark:text-white">{session.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tenant Memberships Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tenant Memberships</h2>
        <div className="space-y-4">
          {tenants.map(({ tenant, role }) => (
            <div key={tenant.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{tenant.name}</h3>
                  {tenant.details && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tenant.details}</p>
                  )}
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {role || 'Member'}
                </span>
              </div>
            </div>
          ))}
          {tenants.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400">You are not a member of any tenants.</p>
          )}
        </div>
      </div>
    </div>
  );
} 