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

export default function AddApplication() {
  const isDark = useDarkMode();
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