'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/app/hooks/useDarkMode';
import { commonStyles } from '@/app/styles/commonStyles';

interface Application {
  id: string;
  application: string;
  name: string;
  details: string | null;
  created: string;
  updated: string;
}

interface DeleteModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDark: boolean;
}

function DeleteConfirmationModal({ application, isOpen, onClose, onConfirm, isDark }: DeleteModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmName === application.name) {
      onConfirm();
    } else {
      setError('Application name does not match');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Delete Application
        </h3>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          This action cannot be undone. Please type <span className="font-semibold">{application.name}</span> to confirm.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className={commonStyles.input(isDark)}
              placeholder="Enter application name to confirm"
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
              Delete Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddApplication() {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    metadata: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let metadata;
      try {
        metadata = formData.metadata ? JSON.parse(formData.metadata) : {};
      } catch (e) {
        setError('Invalid JSON in metadata field');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          metadata,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create application');
      }

      // Clear the form
      setFormData({
        name: '',
        details: '',
        metadata: ''
      });

      // Refresh the applications list
      await fetchApplications();
    } catch (err) {
      console.error('Error creating application:', err);
      setError(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (applicationId: string) => {
    router.push(`/dashboard/edit-application/${applicationId}`);
  };

  const handleDelete = async (application: Application) => {
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      await fetchApplications(); // Refresh the list
      setApplicationToDelete(null); // Close the modal
    } catch (err) {
      console.error('Error deleting application:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  return (
    <div className={commonStyles.container(isDark)}>
      <div className="mb-10">
        <h1 className={commonStyles.heading(isDark)}>Add New Application</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className={commonStyles.error(isDark)}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Name
            </label>
            <input
              type="text"
              id="name"
              required
              className={commonStyles.input(isDark)}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="details" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Details
            </label>
            <textarea
              id="details"
              rows={3}
              className={commonStyles.input(isDark)}
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="metadata" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Metadata (JSON)
            </label>
            <textarea
              id="metadata"
              rows={4}
              className={`${commonStyles.input(isDark)} font-mono`}
              value={formData.metadata}
              onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
              placeholder="{}"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={commonStyles.button(isDark, isLoading)}
            >
              {isLoading ? 'Creating...' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h2 className={commonStyles.subheading(isDark)}>Application List</h2>
        {isLoadingApps ? (
          <div className={`text-center py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading applications...
          </div>
        ) : (
          <div className={commonStyles.table.container(isDark)}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={commonStyles.table.header(isDark)}>
                <tr>
                  <th className={commonStyles.table.headerCell(isDark)}>
                    Application ID
                  </th>
                  <th className={commonStyles.table.headerCell(isDark)}>
                    Name
                  </th>
                  <th className={commonStyles.table.headerCell(isDark)}>
                    Details
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
                {applications.map((app) => (
                  <tr key={app.id} className={commonStyles.table.row(isDark)}>
                    <td className={commonStyles.table.cell(isDark)}>
                      {app.application}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {app.name}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {app.details || '-'}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {new Date(app.created).toLocaleDateString()}
                    </td>
                    <td className={commonStyles.table.cell(isDark)}>
                      {new Date(app.updated).toLocaleDateString()}
                    </td>
                    <td className={`${commonStyles.table.cell(isDark)} space-x-2`}>
                      <button
                        onClick={() => handleEdit(app.id)}
                        className={`px-3 py-1 rounded-md ${
                          isDark 
                            ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' 
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setApplicationToDelete(app)}
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

      {applicationToDelete && (
        <DeleteConfirmationModal
          application={applicationToDelete}
          isOpen={!!applicationToDelete}
          onClose={() => setApplicationToDelete(null)}
          onConfirm={() => handleDelete(applicationToDelete)}
          isDark={isDark}
        />
      )}
    </div>
  );
} 