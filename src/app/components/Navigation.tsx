'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => {
    return pathname === path ? 'text-white' : 'text-gray-300 hover:text-white';
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                Core Platform
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
                  Home
                </Link>
                {session && (
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/about"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/about')}`}
                >
                  About
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/settings"
                    className={`text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/settings')}`}
                  >
                    {session.user?.username}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/login')}`}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}