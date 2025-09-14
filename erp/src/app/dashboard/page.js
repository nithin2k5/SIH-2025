'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';
import Layout from '../../components/layout/Layout';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { apiService } from '../../services/apiService';
import {
  Users,
  DollarSign,
  Building,
  FileText,
  TrendingUp,
  Calendar,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  Bell,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === USER_ROLES.STUDENT) {
          // Fetch student-specific data
          const [studentData, notificationsData] = await Promise.all([
            apiService.getStudentDashboardStats(user.id),
            apiService.getNotifications(user.id)
          ]);
          setStudentStats(studentData);
          setNotifications(notificationsData);
        } else {
          // Fetch general dashboard data for admin/staff
          const [data, admissions, exams] = await Promise.all([
            apiService.getDashboardStats(),
            apiService.getRecentAdmissions(5),
            apiService.getUpcomingExams(5)
          ]);
          setStats(data);
          setRecentAdmissions(admissions);
          setUpcomingExams(exams);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Student Dashboard View
  if (user?.role === USER_ROLES.STUDENT) {
    const studentStatCards = [
      {
        title: 'Enrolled Courses',
        value: studentStats?.enrolledCourses || 0,
        icon: BookOpen,
        color: 'bg-blue-500',
        description: 'Active courses this semester'
      },
      {
        title: 'Pending Fees',
        value: `₹${studentStats?.pendingFees?.toLocaleString() || 0}`,
        icon: DollarSign,
        color: 'bg-red-500',
        description: 'Amount due for payment'
      },
      {
        title: 'Average Grade',
        value: studentStats?.averageGrade || 'N/A',
        icon: Award,
        color: 'bg-green-500',
        description: 'Current semester GPA'
      },
      {
        title: 'Attendance',
        value: `${studentStats?.attendance || 0}%`,
        icon: Clock,
        color: 'bg-purple-500',
        description: 'Overall attendance rate'
      }
    ];

    const studentQuickActions = [
      {
        title: 'My Courses',
        description: 'View enrolled courses and timetable',
        href: '/student/courses',
        icon: BookOpen,
        color: 'bg-blue-500'
      },
      {
        title: 'Fee Payments',
        description: 'View and pay pending fees',
        href: '/fees',
        icon: DollarSign,
        color: 'bg-green-500'
      },
      {
        title: 'Exam Results',
        description: 'Check your exam results',
        href: '/exams',
        icon: FileText,
        color: 'bg-orange-500'
      },
      {
        title: 'Hostel Info',
        description: 'View hostel allocation details',
        href: '/hostel',
        icon: Building,
        color: 'bg-purple-500'
      }
    ];

    return (
      <Layout>
        {/* Student Header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-slate-600 text-lg mt-1">
                Registration: {user?.registrationNumber || 'CS2024001'} • Semester {user?.semester || 3}
              </p>
            </div>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        </div>

        {/* Student Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {studentStatCards.map((card, index) => (
            <Card key={index} variant="gradient" className="group animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
              <CardContent padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${card.color} shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-200`}>
                    <card.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <p className="text-xs text-slate-500">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center space-x-3 mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
            </div>
            <div className="space-y-4">
              {notifications.slice(0, 3).map((notification, index) => (
                <Card key={notification.id} variant="outline" className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                  <CardContent padding="md">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${
                        notification.type === 'warning' ? 'bg-orange-100' :
                        notification.type === 'error' ? 'bg-red-100' :
                        notification.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <Bell className={`h-4 w-4 ${
                          notification.type === 'warning' ? 'text-orange-600' :
                          notification.type === 'error' ? 'text-red-600' :
                          notification.type === 'success' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{notification.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Student Quick Actions */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentQuickActions.map((action, index) => (
              <Link key={index} href={action.href} className="block group">
                <Card variant="elevated" className="group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full">
                  <CardContent padding="lg" className="text-center">
                    <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-slate-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Admin/Staff Dashboard View
  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.HOSTEL_WARDEN]
    },
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: 'bg-indigo-500',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
    },
    {
      title: 'Fees Collected',
      value: `₹${stats?.totalFeesCollected?.toLocaleString() || 0}`,
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
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: Users,
      color: 'bg-cyan-500',
      roles: [USER_ROLES.ADMIN]
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
      title: 'Manage Courses',
      description: 'Course management',
      href: '/courses',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
    },
    {
      title: 'Fee Management',
      description: 'Process fee payments',
      href: '/fees',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
    },
    {
      title: 'Hostel Management',
      description: 'Manage room assignments',
      href: '/hostel',
      roles: [USER_ROLES.ADMIN, USER_ROLES.HOSTEL_WARDEN]
    },
    {
      title: 'Exam Management',
      description: 'Manage exams and results',
      href: '/exams',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
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
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-slate-600 text-lg mt-1">
                Here&apos;s what&apos;s happening in your college today.
              </p>
            </div>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, index) => (
            <Card key={index} variant="gradient" className="group animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
              <CardContent padding="lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${card.color} shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-200`}>
                    <card.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href} className="block group h-full">
                <Card variant="elevated" className="group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full overflow-hidden min-h-[280px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent padding="lg" className="relative z-10 h-full flex flex-col justify-between">
                    {/* Header Section */}
                    <div>
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                          <TrendingUp className="h-7 w-7 text-white" />
                        </div>
                        <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 group-hover:rotate-45 transition-all duration-300">
                          <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-900 transition-colors line-clamp-2">
                          {action.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm line-clamp-3">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Footer Section */}
                    <div className="pt-4 border-t border-slate-100 mt-auto">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:text-blue-700">
                          <span>Get Started</span>
                          <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

          {/* Recent Activity */}
          <div className="mb-10">
            <div className="flex items-center space-x-3 mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Admissions */}
              <Card variant="elevated" className="animate-slide-up">
                <CardHeader variant="gradient" className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Recent Admissions</h3>
                  </div>
                </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAdmissions.length > 0 ? (
                    recentAdmissions.map((admission, index) => (
                      <div key={admission.admission_id || index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{admission.applicant_name || admission.first_name + ' ' + admission.last_name}</p>
                          <p className="text-xs text-gray-600">
                            {admission.programme_applied} - {new Date(admission.applied_on).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent admissions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

              {/* Upcoming Exams */}
              <Card variant="elevated" className="animate-slide-up" style={{animationDelay: '200ms'}}>
                <CardHeader variant="gradient" className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Upcoming Exams</h3>
                  </div>
                </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingExams.length > 0 ? (
                    upcomingExams.map((exam, index) => (
                      <div key={exam.exam_id || index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{exam.subject || exam.course_name || 'Exam'}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(exam.exam_date).toLocaleDateString()} - {exam.course_id || exam.course_code || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming exams</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </Layout>
  );
}
