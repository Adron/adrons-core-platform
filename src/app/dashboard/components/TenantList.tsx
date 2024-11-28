'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Tenant = {
  tenant: {
    id: string;
    name: string;
    details: string | null;
  };
  role?: string;
};

export default function TenantList() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
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

  // Initial fetch
  useEffect(() => {
    fetchTenants();
  }, []);

  // Refetch on focus
  useEffect(() => {
    const handleFocus = () => {
      fetchTenants();
    };

    window.addEventListener('focus', handleFocus);
    
    // Set up an interval to check for updates
    const intervalId = setInterval(fetchTenants, 5000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  const handleDelete = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tenant');
      }

      router.refresh();
      await fetchTenants();
    } catch (err) {
      console.error('Error deleting tenant:', err);
      alert('Failed to delete tenant');
    }
  };

  if (loading) {
    return <div className="p-4">Loading tenants...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const TenantCard = ({ tenant, isAdmin }: { tenant: Tenant['tenant']; isAdmin: boolean }) => (
    <div className={`p-4 rounded-lg ${isAdmin ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50 border border-gray-200'}`}>
      <h4 className={`font-medium ${isAdmin ? 'text-indigo-900' : 'text-gray-900'}`}>
        {tenant.name}
      </h4>
      <div className="mt-3 flex space-x-4 text-sm">
        <div className="relative group">
          <button
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            Details
          </button>
          {/* Tooltip - positioned to the left */}
          <div className="absolute right-full mr-4 top-0 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-sm rounded shadow-lg z-50">
            <div className="relative">
              <h5 className="font-medium text-white mb-1">{tenant.name}</h5>
              <div className="text-gray-300 text-sm">
                {tenant.details || 'No details available'}
              </div>
              {/* Arrow pointing right */}
              <div className="absolute top-3 -right-[6px] w-0 h-0 
                border-t-[6px] border-t-transparent 
                border-b-[6px] border-b-transparent 
                border-l-[6px] border-l-gray-900">
              </div>
            </div>
          </div>
        </div>
        <Link
          href={`/dashboard/edit-tenant/${tenant.id}`}
          className="text-blue-700 hover:text-blue-900 font-medium"
        >
          Edit
        </Link>
        <button
          onClick={() => handleDelete(tenant.id)}
          className="text-red-700 hover:text-red-900 font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );

  // Separate admin tenants from other tenants
  const adminTenants = tenants.filter((t: Tenant) => t.role === 'ADMIN');
  const otherTenants = tenants.filter((t: Tenant) => t.role !== 'ADMIN');

  return (
    <div className="w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Tenants</h2>
      
      {adminTenants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-900">Administrator</h3>
          <div className="space-y-2">
            {adminTenants.map(({ tenant }) => (
              <TenantCard key={tenant.id} tenant={tenant} isAdmin={true} />
            ))}
          </div>
        </div>
      )}

      {otherTenants.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-900">Member</h3>
          <div className="space-y-2">
            {otherTenants.map(({ tenant }) => (
              <TenantCard key={tenant.id} tenant={tenant} isAdmin={false} />
            ))}
          </div>
        </div>
      )}

      {tenants.length === 0 && (
        <p className="text-gray-700">No tenants found.</p>
      )}
    </div>
  );
} 