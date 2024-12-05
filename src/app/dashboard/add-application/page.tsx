'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddApplication() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    metadata: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error creating application:', err);
      setError(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold mb-6">Add New Application</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="details" className="block text-sm font-medium text-gray-700">
            Details
          </label>
          <textarea
            id="details"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="metadata" className="block text-sm font-medium text-gray-700">
            Metadata (JSON)
          </label>
          <textarea
            id="metadata"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
            value={formData.metadata}
            onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
            placeholder="{}"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${
              isLoading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Application'}
          </button>
        </div>
      </form>
    </div>
  );
} 