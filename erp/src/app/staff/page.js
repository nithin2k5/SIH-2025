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
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  UserPlus,
  CreditCard,
  FileCheck
} from 'lucide-react';

export default function StaffPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      const statsData = await mockApi.getDashboardStats();

      // Mock staff-specific tasks
      const staffTasks = [
        {
          id: 1,
          type: 'admission',
          title: 'Review Admission Application',
          description: 'Review application for Sarah Johnson - Computer Science',
          priority: 'high',
          dueDate: 'Today',
          status: 'pending',
          icon: UserPlus,
          color: 'text-red-600'
        },
        {
          id: 2,
          type: 'fees',
          title: 'Process Fee Payment',
          description: 'Verify payment receipt for Mike Johnson - $2,500',
          priority: 'medium',
          dueDate: 'Tomorrow',
          status: 'in_progress',
          icon: CreditCard,
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'exam',
          title: 'Upload Exam Results',
          description: 'Upload Thermodynamics exam results for Semester 4',
          priority: 'high',
          dueDate: 'This Week',
          status: 'pending',
          icon: FileCheck,
          color: 'text-purple-600'
        },
        {
          id: 4,
          type: 'report',
          title: 'Generate Monthly Report',
          description: 'Prepare admissions report for October 2024',
          priority: 'low',
          dueDate: 'Next Week',
          status: 'pending',
          icon: FileText,
          color: 'text-green-600'
        }
      ];

      setStats(statsData);
      setTasks(staffTasks);
    } catch (error) {
      console.error('Error loading staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const staffActions = [
    {
      title: 'New Admission',
      description: 'Process new student admissions',
      icon: UserPlus,
      href: '/admissions/new',
      color: 'bg-blue-500',
      count: '3 pending'
    },
    {
      title: 'Fee Collection',
      description: 'Manage student fee payments',
      icon: DollarSign,
      href: '/fees',
      color: 'bg-green-500',
      count: '$12,500 due'
    },
    {
      title: 'Exam Management',
      description: 'Upload and manage exam results',
      icon: FileText,
      href: '/exams',
      color: 'bg-purple-500',
      count: '2 uploads pending'
    },
    {
      title: 'Reports',
      description: 'Generate student reports',
      icon: TrendingUp,
      href: '/staff/reports',
      color: 'bg-orange-500',
      count: 'Monthly due'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Staff Dashboard' }]} />

      {/* Header */}
      <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.name}. Here's your daily overview.
              </p>
            </div>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </Button>
          </div>
        </div>

        {/* Staff Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Students Managed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                  <p className="text-xs text-green-600 mt-1">Active enrollments</p>
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
                  <p className="text-sm font-medium text-gray-600">Fees Collected</p>
                  <p className="text-2xl font-bold text-gray-900">${stats?.totalFeesCollected?.toLocaleString() || 0}</p>
                  <p className="text-xs text-green-600 mt-1">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter(t => t.status === 'pending').length}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Require attention</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter(t => t.status === 'completed').length}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Tasks done</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {staffActions.map((action, index) => (
              <Link key={index} href={action.href} className="block">
                <Card className="hover:shadow-lg hover:border-green-200 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-green-200">
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
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {action.count}
                          </span>
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Tasks & Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Pending Tasks</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.filter(task => task.status !== 'completed').map(task => (
                  <div key={task.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <task.icon className={`h-5 w-5 ${task.color}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Admission Processed</p>
                    <p className="text-sm text-gray-600">John Doe's admission application approved</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Fee Payment Received</p>
                    <p className="text-sm text-gray-600">Payment of $1,500 processed for Jane Smith</p>
                    <p className="text-xs text-gray-500 mt-1">4 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Exam Results Uploaded</p>
                    <p className="text-sm text-gray-600">Mathematics exam results for Semester 2 uploaded</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Schedule Updated</p>
                    <p className="text-sm text-gray-600">Counseling session scheduled for tomorrow</p>
                    <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">This Month's Performance</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                <p className="text-sm text-gray-600">Admissions Processed</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">$28,500</div>
                <p className="text-sm text-gray-600">Fees Collected</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">96%</div>
                <p className="text-sm text-gray-600">Task Completion Rate</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '96%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </Layout>
  );
}
