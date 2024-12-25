'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/hooks/useDarkMode';
import { commonStyles } from '@/app/styles/commonStyles';

interface Tenant {
  id: string;
  name: string;
  details?: string | null;
  created: string;
  updated: string;
  isAdmin: boolean;
  roles?: {
    id: string;
    name: string;
  }[];
}

interface TenantCardProps {
  tenant: Tenant;
  isAdmin: boolean;
}

function TenantCard({ tenant, isAdmin }: TenantCardProps) {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-200 ${
        isDark 
          ? `border-gray-700 bg-gray-800 ${isHovered ? 'border-gray-600' : ''}` 
          : `border-gray-200 bg-white ${isHovered ? 'border-gray-300 shadow-md' : ''}`
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-medium ${
            isDark ? 'text-gray-200' : 'text-gray-900'
          }`}>
            {tenant.name}
          </h3>
          {tenant.details && (
            <p className={`mt-1 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {tenant.details}
            </p>
          )}
          <div className="mt-2 text-xs text-gray-500">
            Created: {new Date(tenant.created).toLocaleDateString()}
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Admin
              </span>
            )}
            <button
              onClick={() => router.push(`/dashboard/edit-tenant/${tenant.id}`)}
              className={`px-3 py-1 rounded-md text-sm ${
                isDark 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Edit
            </button>
          </div>
          {isAdmin && isHovered && (
            <button
              onClick={() => router.push(`/dashboard/tenant/${tenant.id}/manage-users`)}
              className={`px-3 py-1 rounded-md text-sm ${
                isDark 
                  ? 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800' 
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              Manage Users
            </button>
          )}
        </div>
      </div>
      {tenant.roles && tenant.roles.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {tenant.roles.map((role, index) => (
            <span
              key={role.id || index}
              className={`text-xs px-2 py-1 rounded-full ${
                isDark 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {role.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TenantList() {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const [tenants, setTenants] = useState<{ tenant: Tenant }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('/api/tenants');
        if (!response.ok) throw new Error('Failed to fetch tenants');
        const data = await response.json();
        setTenants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tenants');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, []);

  if (isLoading) {
    return (
      <div className={`text-center py-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
        Loading tenants...
      </div>
    );
  }

  if (error) {
    return (
      <div className={commonStyles.error(isDark)}>
        {error}
      </div>
    );
  }

  const adminTenants = tenants.filter(({ tenant }) => tenant.isAdmin);
  const otherTenants = tenants.filter(({ tenant }) => !tenant.isAdmin);

  return (
    <div className="space-y-8">
      {adminTenants.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className={commonStyles.subheading(isDark)}>Administered Tenants</h2>
            <button
              onClick={() => router.push('/dashboard/add-tenant')}
              className={commonStyles.button(isDark, false)}
            >
              Add New Tenant
            </button>
          </div>
          <div className="space-y-3">
            {adminTenants.map(({ tenant }) => (
              <TenantCard key={tenant.id} tenant={tenant} isAdmin={true} />
            ))}
          </div>
        </div>
      )}

      {otherTenants.length > 0 && (
        <div>
          <h2 className={commonStyles.subheading(isDark)}>Tenants</h2>
          <div className="space-y-3">
            {otherTenants.map(({ tenant }) => (
              <TenantCard key={tenant.id} tenant={tenant} isAdmin={false} />
            ))}
          </div>
        </div>
      )}

      {tenants.length === 0 && (
        <div className="text-center space-y-4">
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No tenants found.
          </p>
          <button
            onClick={() => router.push('/dashboard/add-tenant')}
            className={commonStyles.button(isDark, false)}
          >
            Create Your First Tenant
          </button>
        </div>
      )}
    </div>
  );
} 