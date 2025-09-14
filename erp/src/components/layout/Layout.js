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
  User,
  BookOpen
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
    name: 'Courses',
    href: '/courses',
    icon: BookOpen,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
  },
  {
    name: 'My Courses',
    href: '/student/courses',
    icon: BookOpen,
    roles: [USER_ROLES.STUDENT]
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

  const filteredNavItems = navigationItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 border-r border-slate-200/60 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-all duration-300 ease-out lg:translate-x-0`}>

        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ERP</span>
            </div>
            <h1 className="text-xl font-bold text-white">College ERP</h1>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-6 py-5 border-b border-slate-200/60">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize truncate">
                  {user.role?.replace('_', ' ')} • {user.department}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 animate-slide-up ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
                style={{animationDelay: `${index * 50}ms`}}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-slate-200/60">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72 flex flex-col min-h-screen w-0 flex-1">
        {/* Top bar - Mobile only */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">ERP</span>
              </div>
              <h1 className="text-lg font-bold gradient-text">College ERP</h1>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl w-full mx-auto animate-slide-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
