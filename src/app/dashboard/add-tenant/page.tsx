'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/app/hooks/useDarkMode';
import { commonStyles } from '@/app/styles/commonStyles';

export default function AddTenant() {
  const isDark = useDarkMode();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tenant');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to create tenant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={commonStyles.container(isDark)}>
      <div className="mb-10">
        <h1 className={commonStyles.heading(isDark)}>Add New Tenant</h1>
        
        {error && (
          <div className={commonStyles.error(isDark)}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Tenant Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={commonStyles.input(isDark)}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={commonStyles.input(isDark)}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={commonStyles.button(isDark, isLoading)}
            >
              {isLoading ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 