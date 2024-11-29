'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
    </div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-white dark:bg-gray-900">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Dashboard</h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Welcome, {session.user?.username || 'User'}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">You are successfully logged in.</p>
        </div>
      </div>
    </main>
  );
}