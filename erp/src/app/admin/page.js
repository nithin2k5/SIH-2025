'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { mockApi } from '../../services/mockData';
import {
  Users,
  DollarSign,
  Building,
  FileText,
  Settings,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  FileSpreadsheet,
  Database
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, students] = await Promise.all([
        mockApi.getDashboardStats(),
        mockApi.getStudents()
      ]);

      setStats(statsData);

      // Mock recent activity
      const activity = [
        {
          id: 1,
          type: 'admission',
          title: 'New Student Admission',
          description: `${students[students.length - 1]?.name || 'John Doe'} was admitted to Computer Science`,
          time: '2 hours ago',
          icon: UserPlus,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'payment',
          title: 'Fee Payment Processed',
          description: 'Payment of $1,500 received from Jane Smith',
          time: '4 hours ago',
          icon: DollarSign,
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'exam',
          title: 'Exam Results Uploaded',
          description: 'Data Structures exam results for Semester 3 published',
          time: '1 day ago',
          icon: FileText,
          color: 'text-purple-600'
        },
        {
          id: 4,
          type: 'hostel',
          title: 'Room Allocation',
          description: 'Room A-102 allocated to Mike Johnson',
          time: '2 days ago',
          icon: Building,
          color: 'text-orange-600'
        }
      ];

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const adminActions = [
    {
      title: 'User Management',
      description: 'Add, edit, and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences and rules',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500'
    },
    {
      title: 'Reports & Analytics',
      description: 'Generate detailed reports and insights',
      icon: TrendingUp,
      href: '/admin/reports',
      color: 'bg-green-500'
    },
    {
      title: 'Data Import/Export',
      description: 'Import data from CSV or export system data',
      icon: FileSpreadsheet,
      href: '/admin/data',
      color: 'bg-purple-500'
    },
    {
      title: 'Backup & Recovery',
      description: 'Manage system backups and data recovery',
      icon: Database,
      href: '/admin/backup',
      color: 'bg-orange-500'
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and audit trails',
      icon: Shield,
      href: '/admin/audit',
      color: 'bg-red-500'
    }
  ];

  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Admin Dashboard' }]} />

      {/* Header */}
      <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.name}. Manage your college ERP system.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Button>
              <Button>
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </div>
          </div>
        </div>

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                  <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats?.totalFeesCollected?.toLocaleString() || 0}</p>
                  <p className="text-xs text-green-600 mt-1">+8% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hostel Occupancy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.hostelOccupancy || 0}%</p>
                  <p className="text-xs text-blue-600 mt-1">Current utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Exams</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingExams || 0}</p>
                  <p className="text-xs text-orange-600 mt-1">Pending results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Services</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">File Storage</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Available</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backup Status</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Up to date</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Fee Payment Due</p>
                    <p className="text-xs text-gray-600">5 students have overdue fees</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Hostel Maintenance</p>
                    <p className="text-xs text-gray-600">Room B-201 requires maintenance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">System Update</p>
                    <p className="text-xs text-gray-600">Security patches applied successfully</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-medium">247</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Server Load</span>
                    <span className="font-medium">32%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '32%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Storage Used</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{width: '68%'}}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Administrative Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminActions.map((action, index) => (
              <Link key={index} href={action.href} className="block">
                <Card className="hover:shadow-lg hover:border-purple-200 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shadow-sm`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                        <div className="mt-3 flex items-center justify-end">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </Layout>
  );
}
