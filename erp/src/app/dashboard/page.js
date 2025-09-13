'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';
import Layout from '../../components/layout/Layout';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { mockApi } from '../../services/mockData';
import {
  Users,
  DollarSign,
  Building,
  FileText,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await mockApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.HOSTEL_WARDEN]
    },
    {
      title: 'Fees Collected',
      value: `$${stats?.totalFeesCollected?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-green-500',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
    },
    {
      title: 'Hostel Occupancy',
      value: `${stats?.hostelOccupancy || 0}%`,
      icon: Building,
      color: 'bg-purple-500',
      roles: [USER_ROLES.ADMIN, USER_ROLES.HOSTEL_WARDEN]
    },
    {
      title: 'Pending Exams',
      value: stats?.pendingExams || 0,
      icon: FileText,
      color: 'bg-orange-500',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
    }
  ].filter(card => card.roles.includes(user?.role));

  const quickActions = [
    {
      title: 'New Admission',
      description: 'Add a new student',
      href: '/admissions/new',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
    },
    {
      title: 'View Students',
      description: 'Browse student records',
      href: '/admissions',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
    },
    {
      title: 'Fee Payment',
      description: 'Process fee payments',
      href: '/fees',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.STUDENT]
    },
    {
      title: 'Hostel Allocation',
      description: 'Manage room assignments',
      href: '/hostel',
      roles: [USER_ROLES.ADMIN, USER_ROLES.HOSTEL_WARDEN, USER_ROLES.STUDENT]
    },
    {
      title: 'Exam Results',
      description: 'View and manage results',
      href: '/exams',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.STUDENT]
    },
    {
      title: 'Admin Panel',
      description: 'System administration',
      href: '/admin',
      roles: [USER_ROLES.ADMIN]
    },
    {
      title: 'Staff Panel',
      description: 'Staff management tools',
      href: '/staff',
      roles: [USER_ROLES.STAFF]
    }
  ].filter(action => action.roles.includes(user?.role));

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening in your college today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${card.color} shadow-sm flex-shrink-0`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href} className="block group">
              <Card className="hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-300 h-full">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Admissions */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Admissions</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">John Doe</p>
                      <p className="text-xs text-gray-600">Computer Science - Jan 15, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Jane Smith</p>
                      <p className="text-xs text-gray-600">Mechanical Engineering - Feb 1, 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Exams */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Exams</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Data Structures</p>
                      <p className="text-xs text-gray-600">Dec 15, 2024 - CS-101</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Thermodynamics</p>
                      <p className="text-xs text-gray-600">Dec 18, 2024 - ME-201</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </Layout>
  );
}
