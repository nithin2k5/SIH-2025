'use client';

import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  User,
  Shield,
  Users,
  Settings
} from 'lucide-react';

const routes = [
  { path: '/', name: 'Home', roles: 'all' },
  { path: '/auth/login', name: 'Login', roles: 'public' },
  { path: '/dashboard', name: 'Student Dashboard', roles: [USER_ROLES.STUDENT] },
  { path: '/admin', name: 'Admin Dashboard', roles: [USER_ROLES.ADMIN] },
  { path: '/staff', name: 'Staff Dashboard', roles: [USER_ROLES.STAFF] },
  { path: '/admissions', name: 'Admissions', roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF] },
  { path: '/admissions/new', name: 'New Admission', roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF] },
  { path: '/fees', name: 'Fee Payment', roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.STUDENT] },
  { path: '/hostel', name: 'Hostel Management', roles: [USER_ROLES.ADMIN, USER_ROLES.HOSTEL_WARDEN, USER_ROLES.STUDENT] },
  { path: '/exams', name: 'Exams', roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.STUDENT] }
];

const demoUsers = [
  { role: USER_ROLES.ADMIN, name: 'Admin User', email: 'admin@college.edu', password: 'password' },
  { role: USER_ROLES.STAFF, name: 'Staff User', email: 'staff@college.edu', password: 'password' },
  { role: USER_ROLES.HOSTEL_WARDEN, name: 'Hostel Warden', email: 'warden@college.edu', password: 'password' },
  { role: USER_ROLES.STUDENT, name: 'Student User', email: 'student@college.edu', password: 'password' }
];

export default function DebugPage() {
  const { user, login, logout } = useAuth();

  const canAccessRoute = (route) => {
    if (!user) return false;
    if (route.roles === 'all' || route.roles === 'public') return true;
    if (Array.isArray(route.roles)) {
      return route.roles.includes(user.role);
    }
    return false;
  };

  const getRouteStatus = (route) => {
    if (route.roles === 'public') return 'public';
    if (!user) return 'login-required';
    return canAccessRoute(route) ? 'accessible' : 'restricted';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'public':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'accessible':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'restricted':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'login-required':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'public':
        return 'text-green-700 bg-green-100';
      case 'accessible':
        return 'text-green-700 bg-green-100';
      case 'restricted':
        return 'text-red-700 bg-red-100';
      case 'login-required':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const handleLoginAs = async (demoUser) => {
    const result = await login(demoUser.email, demoUser.password);
    if (result.success) {
      // Force a page reload to ensure middleware recognizes the new cookie
      window.location.reload();
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Navigation Debug Panel</h1>
          <p className="text-gray-600 mt-2">
            Test and verify all page routes and navigation functionality
          </p>
        </div>

        {/* Current User Status */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Current User Status</h2>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{user.role.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button onClick={logout} variant="secondary">
                    Logout
                  </Button>
                </div>

                {/* Cookie and Storage Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-800">localStorage</div>
                    <div className="text-xs text-green-600 mt-1">✅ Available</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Cookies</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {typeof window !== 'undefined' && document.cookie.includes('erp-user') ? '✅ Set' : '❌ Not set'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">Middleware</div>
                    <div className="text-xs text-purple-600 mt-1">🔍 Check logs</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No user logged in</p>

                {/* Storage Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-800">localStorage</div>
                    <div className="text-xs text-green-600 mt-1">
                      {typeof window !== 'undefined' && localStorage.getItem('erp-user') ? '✅ Has data' : '❌ Empty'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Cookies</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {typeof window !== 'undefined' && document.cookie.includes('erp-user') ? '✅ Set' : '❌ Not set'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">Middleware</div>
                    <div className="text-xs text-purple-600 mt-1">🔍 Check logs</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Login */}
        {!user && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Demo Login</h2>
              <p className="text-sm text-gray-600">Quick login as different user types</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {demoUsers.map((demoUser, index) => (
                  <button
                    key={index}
                    onClick={() => handleLoginAs(demoUser)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      {demoUser.role === USER_ROLES.ADMIN && <Shield className="h-5 w-5 text-red-500" />}
                      {demoUser.role === USER_ROLES.STAFF && <Settings className="h-5 w-5 text-blue-500" />}
                      {demoUser.role === USER_ROLES.HOSTEL_WARDEN && <Users className="h-5 w-5 text-green-500" />}
                      {demoUser.role === USER_ROLES.STUDENT && <User className="h-5 w-5 text-purple-500" />}
                      <span className="font-medium capitalize">{demoUser.role.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-gray-600">{demoUser.email}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Route Status */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Route Accessibility</h2>
            <p className="text-sm text-gray-600">Check which pages are accessible with current user</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {routes.map((route, index) => {
                const status = getRouteStatus(route);
                return (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(status)}
                      <div>
                        <Link
                          href={route.path}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {route.name}
                        </Link>
                        <p className="text-sm text-gray-500 font-mono">{route.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                        {status.replace('-', ' ')}
                      </span>
                      {status !== 'login-required' && (
                        <Link href={route.path}>
                          <Button size="sm" variant="secondary">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Navigation Test</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/">
                  <Button className="w-full justify-start" variant="secondary">
                    🏠 Home Page
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="w-full justify-start" variant="secondary">
                    📊 Dashboard
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button className="w-full justify-start" variant="secondary">
                    🔐 Login Page
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">System Info</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Server Status:</span>
                  <span className="text-green-600 font-medium">✅ Running</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Framework:</span>
                  <span className="font-medium">Next.js 15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">UI Library:</span>
                  <span className="font-medium">Tailwind CSS v4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Authentication:</span>
                  <span className="font-medium">Mock System</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </Layout>
  );
}
