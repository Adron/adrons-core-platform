'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

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
    return <div>Please sign in to view settings.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">User Settings</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Username</label>
            <p className="mt-1 text-gray-900">{session.user?.username}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{session.user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tenant Memberships</h2>
        <div className="space-y-4">
          {tenants.map(({ tenant, role }) => (
            <div key={tenant.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{tenant.name}</h3>
                  {tenant.details && (
                    <p className="text-sm text-gray-600 mt-1">{tenant.details}</p>
                  )}
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {role || 'Member'}
                </span>
              </div>
            </div>
          ))}
          {tenants.length === 0 && (
            <p className="text-gray-600">You are not a member of any tenants.</p>
          )}
        </div>
      </div>
    </div>
  );
} 