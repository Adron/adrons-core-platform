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
  metadata: any;
  created: string;
  updated: string;
}

export default function EditApplication({ params }: { params: { id: string } }) {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    metadata: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch application');
        }
        const data: Application = await response.json();
        setFormData({
          name: data.name,
          details: data.details || '',
          metadata: JSON.stringify(data.metadata || {}, null, 2)
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [params.id]);

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

      const response = await fetch(`/api/applications/${params.id}`, {
        method: 'PUT',
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
        throw new Error(data.error || 'Failed to update application');
      }

      router.push('/dashboard/add-application');
      router.refresh();
    } catch (err) {
      console.error('Error updating application:', err);
      setError(err instanceof Error ? err.message : 'Failed to update application');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`text-center py-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
        Loading...
      </div>
    );
  }

  return (
    <div className={commonStyles.container(isDark)}>
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className={commonStyles.heading(isDark)}>Edit Application</h1>
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

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className={commonStyles.button(isDark, isLoading)}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className={`flex-1 py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors
                ${isDark 
                  ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${isDark ? 'focus:ring-offset-gray-900' : ''}`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 