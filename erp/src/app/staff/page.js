'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { apiService } from '../../services/apiService';
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Building,
  Award,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap
} from 'lucide-react';

export default function StaffPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsData, feesData, paymentsData, examsData] = await Promise.all([
        apiService.getStudents(),
        apiService.getFees(),
        apiService.getPayments(),
        apiService.getExams()
      ]);

      setStudents(studentsData.students || []);
      setFees(feesData);
      setPayments(paymentsData.payments || []);
      setExams(examsData.exams || []);
    } catch (error) {
      console.error('Error fetching staff panel data:', error);
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

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const totalFeesCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingFees = fees.filter(fee => fee.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0);
  const upcomingExams = exams.filter(exam => new Date(exam.examDate) >= new Date()).length;
  const completedExams = exams.filter(exam => exam.status === 'completed').length;
  
  const departments = [...new Set(students.map(s => s.department))];
  
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || student.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const recentPayments = payments.slice(0, 5);
  const studentsWithPendingFees = new Set(fees.filter(fee => fee.status === 'pending').map(fee => fee.studentId)).size;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Staff Dashboard</h1>
            <p className="text-slate-600 text-lg mt-1">
              Overview of students, fees, payments, and exam data
            </p>
          </div>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="gradient" className="animate-slide-up">
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
                <p className="text-xs text-slate-500 mt-1">{activeStudents} active</p>
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
                <p className="text-sm font-semibold text-slate-600 mb-1">Fees Collected</p>
                <p className="text-3xl font-bold text-green-600">₹{totalFeesCollected.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{payments.length} payments</p>
              </div>
              <div className="p-4 bg-green-500 rounded-2xl shadow-lg">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '200ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Pending Fees</p>
                <p className="text-3xl font-bold text-red-600">₹{pendingFees.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{studentsWithPendingFees} students</p>
              </div>
              <div className="p-4 bg-red-500 rounded-2xl shadow-lg">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '300ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Upcoming Exams</p>
                <p className="text-3xl font-bold text-orange-600">{upcomingExams}</p>
                <p className="text-xs text-slate-500 mt-1">{completedExams} completed</p>
              </div>
              <div className="p-4 bg-orange-500 rounded-2xl shadow-lg">
                <FileText className="h-7 w-7 text-white" />
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
            { id: 'students', label: 'Students', icon: Users },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'exams', label: 'Exams', icon: FileText }
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
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Department Breakdown */}
            <Card variant="elevated">
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <BookOpen className="h-6 w-6 mr-3" />
                  Students by Department
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <div className="space-y-4">
                  {departments.map((dept, index) => {
                    const deptStudents = students.filter(s => s.department === dept).length;
                    const percentage = (deptStudents / totalStudents) * 100;
                    return (
                      <div key={dept} className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-slate-700">{dept}</span>
                          <span className="text-sm text-slate-600">{deptStudents} students</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card variant="elevated">
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Clock className="h-6 w-6 mr-3" />
                  Recent Payments
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <div className="space-y-4">
                  {recentPayments.map((payment, index) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{payment.studentName}</p>
                          <p className="text-sm text-slate-600">₹{payment.amount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card variant="elevated">
            <CardHeader variant="gradient">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <TrendingUp className="h-6 w-6 mr-3" />
                Monthly Overview
              </h3>
            </CardHeader>
            <CardContent padding="lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">23</p>
                  <p className="text-sm text-slate-600">New Admissions</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹2.4L</p>
                  <p className="text-sm text-slate-600">Fees Collected</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">8</p>
                  <p className="text-sm text-slate-600">Exams Conducted</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">87%</p>
                  <p className="text-sm text-slate-600">Pass Rate</p>
                </div>
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
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={Search}
                  />
                </div>
                <div className="flex gap-4">
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map((student, index) => (
              <Card key={student.id} variant="elevated" className="animate-slide-up" style={{animationDelay: `${index * 50}ms`}}>
                <CardHeader variant="gradient" className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
                        <p className="text-sm text-slate-600">{student.registrationNumber}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' :
                      student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent padding="lg">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <BookOpen className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">{student.course}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">Semester {student.semester}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">{student.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">{student.phone}</span>
                    </div>
                    {student.hostelAllocated && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Building className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600">Room {student.roomNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <Card variant="outline" className="text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No students found</h3>
                <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader variant="gradient">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Payment Records</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Method</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {payments.slice(0, 20).map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-slate-900">{payment.studentName}</div>
                            <div className="text-sm text-slate-600">ID: {payment.studentId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-green-600">
                          ₹{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 capitalize">{payment.paymentMethod}</td>
                        <td className="px-6 py-4">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">{payment.receiptNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Exams */}
            <Card variant="elevated">
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Calendar className="h-6 w-6 mr-3" />
                  Upcoming Exams
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <div className="space-y-4">
                  {exams.filter(exam => new Date(exam.examDate) >= new Date()).slice(0, 5).map((exam, index) => (
                    <div key={exam.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                      <div>
                        <h4 className="font-semibold text-slate-900">{exam.subject}</h4>
                        <p className="text-sm text-slate-600">{exam.course} • {new Date(exam.examDate).toLocaleDateString()}</p>
                        <p className="text-sm text-slate-500">{exam.startTime} - {exam.endTime} • {exam.room}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {exam.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exam Statistics */}
            <Card variant="elevated">
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Award className="h-6 w-6 mr-3" />
                  Exam Statistics
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <div className="space-y-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{completedExams}</p>
                    <p className="text-sm text-slate-600">Completed Exams</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{upcomingExams}</p>
                    <p className="text-sm text-slate-600">Upcoming Exams</p>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">87%</p>
                    <p className="text-sm text-slate-600">Average Pass Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}