'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../types';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to appropriate dashboard based on role
        switch (user.role) {
          case USER_ROLES.ADMIN:
            router.push('/admin');
            break;
          case USER_ROLES.STAFF:
            router.push('/staff');
            break;
          case USER_ROLES.HOSTEL_WARDEN:
            router.push('/hostel');
            break;
          case USER_ROLES.STUDENT:
            router.push('/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading College ERP...</p>
      </div>
    </div>
  );
}
