'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { fetchCurrentUser, logoutUser } from '@/lib/auth';
import { User } from '@/lib/types';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, [pathname]);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    router.push('/login');
  };

  const roleColors: Record<string, string> = {
    organization: 'bg-purple-100 text-purple-800 border-purple-200',
    university: 'bg-blue-100 text-blue-800 border-blue-200',
    contributor: 'bg-green-100 text-green-800 border-green-200',
    admin: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-6">
        <Link href="/" className="font-bold text-xl text-indigo-600 tracking-tight">
          SIH26043 Platform
        </Link>
        <div className="hidden md:flex space-x-4 text-sm font-medium text-gray-600">
          <Link href="/challenges" className="hover:text-indigo-600 transition">Challenges</Link>
          <Link href="/teams" className="hover:text-indigo-600 transition">Teams</Link>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        {loading ? (
          <div className="h-6 w-20 bg-gray-100 animate-pulse rounded"></div>
        ) : user ? (
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-800">{user.full_name}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize font-medium ${roleColors[user.role] || 'bg-gray-100'}`}>
              {user.role}
            </span>
            {user.role === 'organization' && user.org_id && (
              <Link href={`/profiles/org/${user.org_id}`} className="text-indigo-600 hover:text-indigo-800 font-semibold transition">
                My Profile
              </Link>
            )}
            {user.role === 'university' && user.university_id && (
              <Link href={`/profiles/university/${user.university_id}`} className="text-indigo-600 hover:text-indigo-800 font-semibold transition">
                My Profile
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 font-medium transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-1.5 rounded-md hover:bg-gray-50 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-1.5 rounded-md shadow-sm transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
