'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardSubmenu() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path 
      ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' 
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white';
  };

  return (
    <div className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          <Link
            href="/dashboard/add-tenant"
            className={`inline-flex items-center px-3 py-2 text-sm font-medium border-b-2 ${
              isActive('/dashboard/add-tenant')
                ? 'border-indigo-500 dark:border-indigo-400'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Tenant
          </Link>

          <Link
            href="/dashboard/add-application"
            className={`inline-flex items-center px-3 py-2 text-sm font-medium border-b-2 ${
              isActive('/dashboard/add-application')
                ? 'border-indigo-500 dark:border-indigo-400'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Application
          </Link>

          <Link
            href="/dashboard/add-user"
            className={`inline-flex items-center px-3 py-2 text-sm font-medium border-b-2 ${
              isActive('/dashboard/add-user')
                ? 'border-indigo-500 dark:border-indigo-400'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add User
          </Link>
        </div>
      </div>
    </div>
  );
} 