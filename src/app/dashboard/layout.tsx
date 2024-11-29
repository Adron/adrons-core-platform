import Link from 'next/link';
import TenantList from './components/TenantList';
import DashboardSubmenu from './components/DashboardSubmenu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardSubmenu />
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex gap-6">
          <div className="flex-1">
            {children}
          </div>
          <div className="w-80">
            <TenantList />
          </div>
        </div>
      </div>
    </div>
  );
} 