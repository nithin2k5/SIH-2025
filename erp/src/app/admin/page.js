'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { apiService } from '../../services/apiService';
import {
  Shield,
  Users,
  DollarSign,
  Building,
  FileText,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Database,
  Activity,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  GraduationCap,
  Upload,
  Server,
  Zap,
  Globe,
  Lock,
  Bell,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  X
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch all required data from real APIs
      const [statsData, usersData, studentsData, systemHealthData, recentActivityData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getUsers(),
        apiService.getStudents(),
        apiService.getSystemHealth(),
        apiService.getRecentActivity()
      ]);

      setStats(statsData);

      // Map users data to match frontend expectations
      if (usersData && usersData.users) {
        const mappedUsers = usersData.users.map(user => ({
          id: user.user_id,
          name: user.display_name || user.username,
          email: user.email,
          role: user.role,
          status: user.active ? 'active' : 'inactive',
          lastLogin: user.last_login ? new Date(user.last_login) : null,
          department: user.notes || 'N/A'
        }));
        setUsers(mappedUsers);
      }

      // Set system health data
      if (systemHealthData && systemHealthData.health) {
        setSystemHealth(systemHealthData.health);
      }

      // Map students data to match frontend expectations
      if (studentsData && studentsData.students) {
        const mappedStudents = studentsData.students.map(student => ({
          id: student.student_id,
          studentId: student.student_id,
          name: `${student.first_name} ${student.last_name}`,
          email: student.email,
          phone: student.phone,
          programmeId: student.programme_id,
          programmeName: student.programme_name,
          enrollmentStatus: student.enrollment_status,
          yearOfStudy: student.year_of_study,
          admissionDate: student.admission_date,
          photoDriveFileId: student.photo_drive_file_id,
          hostelAllocId: student.hostel_alloc_id,
          libraryCardId: student.library_card_id,
          createdAt: student.created_at,
          updatedAt: student.updated_at
        }));
        setStudents(mappedStudents);
      }

      // Set recent activity data
      if (recentActivityData && recentActivityData.activities) {
        const mappedActivity = recentActivityData.activities.map(activity => ({
          id: activity.id,
          type: activity.type,
          action: activity.description,
          user: activity.type === 'system' ? 'System' : 'User',
          timestamp: new Date(activity.timestamp),
          icon: getActivityIcon(activity.type),
          color: getActivityColor(activity.type)
        }));
        setRecentActivity(mappedActivity);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      // Set fallback data for development
      setUsers([]);
      setStudents([]);
      setSystemHealth({
        serverStatus: 'unknown',
        databaseStatus: 'unknown',
        apiResponseTime: 'N/A',
        uptime: 'N/A',
        activeUsers: 0,
        memoryUsage: 0,
        cpuUsage: 0
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper functions for activity icons and colors
  const getActivityIcon = (type) => {
    const iconMap = {
      'user': UserPlus,
      'payment': DollarSign,
      'exam': FileText,
      'system': Database,
      'course': BookOpen,
      'hostel': Building,
      'admission': Users
    };
    return iconMap[type] || Database;
  };

  const getActivityColor = (type) => {
    const colorMap = {
      'user': 'bg-green-500',
      'payment': 'bg-blue-500',
      'exam': 'bg-orange-500',
      'system': 'bg-purple-500',
      'course': 'bg-indigo-500',
      'hostel': 'bg-cyan-500',
      'admission': 'bg-emerald-500'
    };
    return colorMap[type] || 'bg-gray-500';
  };

  const handleCreateUser = async (userData) => {
    try {
      await apiService.createUser(userData);
      fetchData();
      setShowUserModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await apiService.updateUser(selectedUser.id, userData);
      fetchData();
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(userId);
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  // Student CRUD functions
  const handleCreateStudent = async (studentData) => {
    try {
      // Map frontend data to API format (matching Students model)
      const apiData = {
        student_id: studentData.studentId,
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        email: studentData.email,
        phone: studentData.phone || '',
        programme_id: studentData.programmeId || '',
        programme_name: studentData.programmeName || '',
        enrollment_status: studentData.enrollmentStatus || 'active',
        year_of_study: parseInt(studentData.yearOfStudy) || 1,
        admission_date: studentData.admissionDate || new Date().toISOString(),
        photo_drive_file_id: studentData.photoDriveFileId || ''
      };

      await apiService.createStudent(apiData);
      fetchData();
      setShowStudentModal(false);
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Failed to create student. Please try again.');
    }
  };

  const handleUpdateStudent = async (studentData) => {
    try {
      // Map frontend data to API format (matching Students model)
      const apiData = {
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        email: studentData.email,
        phone: studentData.phone || '',
        programme_id: studentData.programmeId || '',
        programme_name: studentData.programmeName || '',
        enrollment_status: studentData.enrollmentStatus || 'active',
        year_of_study: parseInt(studentData.yearOfStudy) || 1,
        photo_drive_file_id: studentData.photoDriveFileId || ''
      };

      await apiService.updateStudent(selectedStudent.id, apiData);
      fetchData();
      setShowStudentModal(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student. Please try again.');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await apiService.deleteStudent(studentId);
        fetchData();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student. Please try again.');
      }
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Admin Panel</h1>
              <p className="text-slate-600 text-lg mt-1">
                System administration and user management
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-5 w-5 mr-2" />
              Export Data
            </Button>
            <Button variant="primary" onClick={() => setShowUserModal(true)}>
              <UserPlus className="h-5 w-5 mr-2" />
              Add User
            </Button>
          </div>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mt-4"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="gradient" className="animate-slide-up">
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                <p className="text-xs text-slate-500 mt-1">{systemHealth.activeUsers} active</p>
              </div>
              <div className="p-4 bg-blue-500 rounded-2xl shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '100ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">System Health</p>
                <p className="text-3xl font-bold text-green-600">{systemHealth.uptime}</p>
                <p className="text-xs text-slate-500 mt-1">Uptime</p>
              </div>
              <div className="p-4 bg-green-500 rounded-2xl shadow-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '200ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Response Time</p>
                <p className="text-3xl font-bold text-orange-600">{systemHealth.apiResponseTime}</p>
                <p className="text-xs text-slate-500 mt-1">API Average</p>
              </div>
              <div className="p-4 bg-orange-500 rounded-2xl shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '300ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Memory Usage</p>
                <p className="text-3xl font-bold text-purple-600">{systemHealth.memoryUsage}%</p>
                <p className="text-xs text-slate-500 mt-1">Server Memory</p>
              </div>
              <div className="p-4 bg-purple-500 rounded-2xl shadow-lg">
                <Server className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'students', label: 'Students', icon: GraduationCap },
            { id: 'system', label: 'System', icon: Server },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="elevated">
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Activity className="h-6 w-6 mr-3" />
                  System Status
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-slate-900">Database</span>
                    </div>
                    <span className="text-green-600 font-semibold">Healthy</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-slate-900">API Server</span>
                    </div>
                    <span className="text-green-600 font-semibold">Online</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-slate-900">Website</span>
                    </div>
                    <span className="text-blue-600 font-semibold">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-slate-900">Security</span>
                    </div>
                    <span className="text-purple-600 font-semibold">Protected</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Bell className="h-6 w-6 mr-3" />
                  Recent Activity
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                      <div className={`p-2 rounded-lg ${activity.color}`}>
                        <activity.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{activity.action}</p>
                        <p className="text-xs text-slate-500">{activity.user} • {activity.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card variant="elevated">
            <CardHeader variant="gradient">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <PieChart className="h-6 w-6 mr-3" />
                Quick Statistics
              </h3>
            </CardHeader>
            <CardContent padding="lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats?.totalStudents || 0}</p>
                  <p className="text-sm text-slate-600">Total Students</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{(stats?.totalFeesCollected || 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-600">Fees Collected</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{stats?.hostelOccupancy || 0}%</p>
                  <p className="text-sm text-slate-600">Hostel Occupancy</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{stats?.pendingExams || 0}</p>
                  <p className="text-sm text-slate-600">Pending Exams</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card variant="outline">
            <CardContent padding="lg">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={Search}
                  />
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value={USER_ROLES.ADMIN}>Admin</option>
                    <option value={USER_ROLES.STAFF}>Staff</option>
                    <option value={USER_ROLES.HOSTEL_WARDEN}>Hostel Warden</option>
                    <option value={USER_ROLES.STUDENT}>Student</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card variant="elevated">
            <CardHeader variant="gradient">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">User Management</h3>
                <Button variant="primary" size="sm" onClick={() => setShowUserModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Last Login</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-600">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                            user.role === USER_ROLES.ADMIN ? 'bg-red-100 text-red-800' :
                            user.role === USER_ROLES.STAFF ? 'bg-blue-100 text-blue-800' :
                            user.role === USER_ROLES.HOSTEL_WARDEN ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.lastLogin.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card variant="outline">
            <CardContent padding="lg">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={Search}
                  />
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card variant="elevated">
            <CardHeader variant="gradient">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Student Management</h3>
                <Button variant="primary" size="sm" onClick={() => setShowStudentModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </CardHeader>
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Student ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Programme</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {students.filter(student =>
                      (searchTerm === '' ||
                       (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (student.studentId || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
                      (filterStatus === 'all' || (student.enrollmentStatus === filterStatus))
                    ).map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {(student.name || 'N A').split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{student.name || 'Unknown Student'}</div>
                              <div className="text-sm text-slate-600">{student.email || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-600">
                          {student.studentId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {student.programmeName || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            (student.enrollmentStatus || 'active') === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.enrollmentStatus || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Server Metrics */}
            <Card variant="elevated">
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Server className="h-6 w-6 mr-3" />
                  Server Metrics
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">CPU Usage</span>
                      <span className="text-sm text-slate-600">{systemHealth.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${systemHealth.cpuUsage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">Memory Usage</span>
                      <span className="text-sm text-slate-600">{systemHealth.memoryUsage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${systemHealth.memoryUsage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{systemHealth.uptime}</p>
                        <p className="text-sm text-slate-600">Uptime</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{systemHealth.apiResponseTime}</p>
                        <p className="text-sm text-slate-600">Response Time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Actions */}
            <Card variant="elevated">
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Settings className="h-6 w-6 mr-3" />
                  System Actions
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-5 w-5 mr-3" />
                    Backup Database
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-5 w-5 mr-3" />
                    Export System Logs
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="h-5 w-5 mr-3" />
                    Import Data
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-5 w-5 mr-3" />
                    System Configuration
                  </Button>
                  
                  <div className="pt-4 border-t border-slate-200">
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50">
                      <AlertTriangle className="h-5 w-5 mr-3" />
                      Emergency Maintenance Mode
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="elevated">
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <LineChart className="h-6 w-6 mr-3" />
                  User Growth
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <p className="text-slate-500">Chart placeholder - User registration trends</p>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3" />
                  Revenue Analytics
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <p className="text-slate-500">Chart placeholder - Fee collection trends</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card variant="elevated" className="w-full max-w-md mx-4">
            <CardHeader variant="gradient">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent padding="lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <Input placeholder="Enter full name" defaultValue={selectedUser?.name} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <Input type="email" placeholder="Enter email address" defaultValue={selectedUser?.email} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={selectedUser?.role || USER_ROLES.STUDENT}
                  >
                    <option value={USER_ROLES.ADMIN}>Admin</option>
                    <option value={USER_ROLES.STAFF}>Staff</option>
                    <option value={USER_ROLES.HOSTEL_WARDEN}>Hostel Warden</option>
                    <option value={USER_ROLES.STUDENT}>Student</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={selectedUser?.status || 'active'}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowUserModal(false);
                      setSelectedUser(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      if (selectedUser) {
                        handleUpdateUser({});
                      } else {
                        handleCreateUser({});
                      }
                    }}
                  >
                    {selectedUser ? 'Update User' : 'Create User'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedStudent ? 'Edit Student' : 'Add New Student'}
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <div className="space-y-4">
                  <Input
                    label="Student ID"
                    placeholder="Enter student ID"
                    disabled={!!selectedStudent}
                    onChange={(e) => setSelectedStudent(prev => ({ ...prev, studentId: e.target.value }))}
                    defaultValue={selectedStudent?.studentId || ''}
                  />
                  <Input
                    label="First Name"
                    placeholder="Enter first name"
                    onChange={(e) => setSelectedStudent(prev => ({ ...prev, firstName: e.target.value }))}
                    defaultValue={selectedStudent?.firstName || ''}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter last name"
                    onChange={(e) => setSelectedStudent(prev => ({ ...prev, lastName: e.target.value }))}
                    defaultValue={selectedStudent?.lastName || ''}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter email address"
                    onChange={(e) => setSelectedStudent(prev => ({ ...prev, email: e.target.value }))}
                    defaultValue={selectedStudent?.email || ''}
                  />
                  <Input
                    label="Phone"
                    placeholder="Enter phone number"
                    onChange={(e) => setSelectedStudent(prev => ({ ...prev, phone: e.target.value }))}
                    defaultValue={selectedStudent?.phone || ''}
                  />
                  <Input
                    label="Programme ID"
                    placeholder="Enter programme ID"
                    onChange={(e) => setSelectedStudent(prev => ({ ...prev, programmeId: e.target.value }))}
                    defaultValue={selectedStudent?.programmeId || ''}
                  />
                  <Input
                    label="Programme Name"
                    placeholder="Enter programme name"
                    onChange={(e) => setSelectedStudent(prev => ({ ...prev, programmeName: e.target.value }))}
                    defaultValue={selectedStudent?.programmeName || ''}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        onChange={(e) => setSelectedStudent(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                        defaultValue={selectedStudent?.yearOfStudy || '1'}
                      >
                        {[1,2,3,4,5,6,7,8].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        onChange={(e) => setSelectedStudent(prev => ({ ...prev, enrollmentStatus: e.target.value }))}
                        defaultValue={selectedStudent?.enrollmentStatus || 'active'}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowStudentModal(false);
                      setSelectedStudent(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      if (selectedStudent && selectedStudent.id) {
                        handleUpdateStudent(selectedStudent);
                      } else {
                        handleCreateStudent(selectedStudent || {});
                      }
                    }}
                  >
                    {selectedStudent?.id ? 'Update Student' : 'Create Student'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}