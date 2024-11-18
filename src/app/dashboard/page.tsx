import { auth } from '../lib/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome, {session.user.username}!</h2>
          <p className="text-gray-600">You are successfully logged in.</p>
        </div>
      </div>
    </main>
  );
}