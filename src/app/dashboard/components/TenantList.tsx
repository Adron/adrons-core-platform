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

// Add new interface for delete modal state
interface DeleteModalState {
  isOpen: boolean;
  tenantId: string;
  tenantName: string;
  inputValue: string;
  error: string | null;
}

export default function TenantList() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    tenantId: '',
    tenantName: '',
    inputValue: '',
    error: null
  });

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

  const handleDeleteClick = (tenantId: string, tenantName: string) => {
    setDeleteModal({
      isOpen: true,
      tenantId,
      tenantName,
      inputValue: '',
      error: null
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      tenantId: '',
      tenantName: '',
      inputValue: '',
      error: null
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.inputValue !== deleteModal.tenantName) {
      setDeleteModal(prev => ({
        ...prev,
        error: 'The tenant name does not match. Please try again.'
      }));
      return;
    }

    try {
      const response = await fetch(`/api/tenants/${deleteModal.tenantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tenant');
      }

      handleDeleteCancel(); // Close modal
      router.refresh();
      await fetchTenants();
    } catch (err) {
      console.error('Error deleting tenant:', err);
      setDeleteModal(prev => ({
        ...prev,
        error: 'Failed to delete tenant. Please try again.'
      }));
    }
  };

  // Delete confirmation modal component
  const DeleteConfirmationModal = () => {
    if (!deleteModal.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Confirm Deletion
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To delete <span className="font-semibold">{deleteModal.tenantName}</span>, please type the tenant name to confirm.
          </p>
          <input
            type="text"
            value={deleteModal.inputValue}
            onChange={(e) => {
              const newValue = e.target.value;
              setDeleteModal(prev => ({
                ...prev,
                inputValue: newValue,
                error: null
              }));
            }}
            autoFocus
            placeholder="Type tenant name here"
            className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
          {deleteModal.error && (
            <p className="text-red-500 dark:text-red-400 mb-4">{deleteModal.error}</p>
          )}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleDeleteCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-4 dark:text-gray-300">Loading tenants...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 dark:text-red-400">Error: {error}</div>;
  }

  const TenantCard = ({ tenant, isAdmin }: { tenant: Tenant['tenant']; isAdmin: boolean }) => (
    <div className={`p-4 rounded-lg ${
      isAdmin 
        ? 'bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800' 
        : 'bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
    }`}>
      <h4 className={`font-medium ${
        isAdmin 
          ? 'text-indigo-900 dark:text-indigo-300' 
          : 'text-gray-900 dark:text-gray-100'
      }`}>
        {tenant.name}
      </h4>
      <div className="mt-3 flex space-x-4 text-sm">
        <div className="relative group">
          <button
            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium"
          >
            Details
          </button>
          {/* Tooltip - positioned to the left */}
          <div className="absolute right-full mr-4 top-0 hidden group-hover:block w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded shadow-lg z-50">
            <div className="relative">
              <h5 className="font-medium text-white mb-1">{tenant.name}</h5>
              <div className="text-gray-300 text-sm">
                {tenant.details || 'No details available'}
              </div>
              {/* Arrow pointing right */}
              <div className="absolute top-3 -right-[6px] w-0 h-0 
                border-t-[6px] border-t-transparent 
                border-b-[6px] border-b-transparent 
                border-l-[6px] border-l-gray-900 dark:border-l-gray-800">
              </div>
            </div>
          </div>
        </div>
        <Link
          href={`/dashboard/edit-tenant/${tenant.id}`}
          className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Edit
        </Link>
        <button
          onClick={() => handleDeleteClick(tenant.id, tenant.name)}
          className="text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
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
    <>
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Tenants</h2>
        
        {adminTenants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Administrator</h3>
            <div className="space-y-2">
              {adminTenants.map(({ tenant }) => (
                <TenantCard key={tenant.id} tenant={tenant} isAdmin={true} />
              ))}
            </div>
          </div>
        )}

        {otherTenants.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Member</h3>
            <div className="space-y-2">
              {otherTenants.map(({ tenant }) => (
                <TenantCard key={tenant.id} tenant={tenant} isAdmin={false} />
              ))}
            </div>
          </div>
        )}

        {tenants.length === 0 && (
          <p className="text-gray-700 dark:text-gray-300">No tenants found.</p>
        )}
      </div>
      <DeleteConfirmationModal />
    </>
  );
} 