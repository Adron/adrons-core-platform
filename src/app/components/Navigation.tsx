'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-indigo-700' : '';
  };

  return (
    <nav className="bg-indigo-600 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Link href="/" 
              className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
              Home
            </Link>|
            <Link href="/dashboard" 
              className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}>
              Dashboard
            </Link>| 
            <Link href="/login" 
              className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/login')}`}>
              Login
            </Link>|
            <Link href="/create-account" 
              className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/create-account')}`}>
              Create Account
            </Link>|
            <Link href="/about" 
              className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/about')}`}>
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}