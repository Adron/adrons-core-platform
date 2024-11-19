'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-indigo-700' : '';
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <nav className="bg-indigo-600 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Link href="/" 
              className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
              Home
            </Link>
            <Link href="/dashboard" 
              className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
            {!session ? (
              <>
                <Link href="/login" 
                  className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/login')}`}>
                  Login
                </Link>
                <Link href="/create-account" 
                  className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/create-account')}`}>
                  Create Account
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Logout
              </button>
            )}
            <Link href="/about" 
              className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/about')}`}>
              About
            </Link>
          </div>
          {session && (
            <div className="text-white text-sm">
              Welcome, {session.user?.username}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}