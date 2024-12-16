'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDarkMode } from '@/hooks/useDarkMode';

export default function DashboardSubmenu() {
  const pathname = usePathname();
  const { isDark } = useDarkMode();
  
  const isActive = (path: string) => {
    if (isDark) {
      return pathname === path 
        ? 'bg-gray-800 text-white border-indigo-400' 
        : 'text-gray-200 hover:bg-gray-800 hover:text-white border-transparent hover:border-gray-600';
    }
    return pathname === path 
      ? 'bg-gray-100 text-gray-900 border-indigo-500' 
      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-transparent hover:border-gray-300';
  };

  const containerClasses = isDark 
    ? 'bg-gray-900 border-gray-700' 
    : 'bg-white border-gray-200';

  const linkBaseClasses = "inline-flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-150";

  return (
    <div className={`border-b ${containerClasses}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          <Link
            href="/dashboard/add-tenant"
            className={`${linkBaseClasses} ${isActive('/dashboard/add-tenant')}`}
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
            className={`${linkBaseClasses} ${isActive('/dashboard/add-application')}`}
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
            className={`${linkBaseClasses} ${isActive('/dashboard/add-user')}`}
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