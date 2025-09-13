'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';
import {
  Home,
  Users,
  DollarSign,
  Building,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  User
} from 'lucide-react';
import Button from '../ui/Button';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.HOSTEL_WARDEN, USER_ROLES.STUDENT]
  },
  {
    name: 'Admissions',
    href: '/admissions',
    icon: Users,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
  },
  {
    name: 'New Admission',
    href: '/admissions/new',
    icon: Users,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
  },
  {
    name: 'Fees',
    href: '/fees',
    icon: DollarSign,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.STUDENT]
  },
  {
    name: 'Hostel',
    href: '/hostel',
    icon: Building,
    roles: [USER_ROLES.ADMIN, USER_ROLES.HOSTEL_WARDEN, USER_ROLES.STUDENT]
  },
  {
    name: 'Exams',
    href: '/exams',
    icon: FileText,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.STUDENT]
  },
  {
    name: 'Admin Panel',
    href: '/admin',
    icon: Shield,
    roles: [USER_ROLES.ADMIN]
  },
  {
    name: 'Staff Panel',
    href: '/staff',
    icon: User,
    roles: [USER_ROLES.STAFF]
  }
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, canAccessModule } = useAuth();
  const pathname = usePathname();

  const filteredNavItems = navigationItems.filter(item =>
    canAccessModule(item.href.replace('/', ''))
  );

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}>

        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">College ERP</h1>
          <button
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="w-full justify-start"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen w-0 flex-1 bg-gray-50">
        {/* Top bar - Mobile only */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              className="p-1 rounded-md text-gray-400 hover:text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">College ERP</h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
