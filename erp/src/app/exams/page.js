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
  FileText,
  Calendar,
  Download,
  Search,
  Eye,
  Edit,
  Plus,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  BookOpen,
  TrendingUp,
  Users,
  Target,
  X,
  Trash2
} from 'lucide-react';

export default function ExamsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const isStudent = user?.role === USER_ROLES.STUDENT;
  const canManageExams = [USER_ROLES.ADMIN, USER_ROLES.STAFF].includes(user?.role);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (isStudent) {
        // Student view - load their results and upcoming exams
        const [examsData, resultsData] = await Promise.all([
          apiService.getExams({ studentId: user.id }),
          apiService.getExamResults(user.id)
        ]);
        // Map exams to ensure they have id property
        const mappedExams = (examsData.exams || []).map(exam => ({
          ...exam,
          id: exam.id || exam.exam_id
        }));
        setExams(mappedExams);
        setExamResults(resultsData);
      } else {
        // Admin/Staff view - load all data
        const [examsData, resultsData] = await Promise.all([
          apiService.getExams(),
          apiService.getExamResults()
        ]);
        // Map exams to ensure they have id property
        const mappedExams = (examsData.exams || []).map(exam => ({
          ...exam,
          id: exam.id || exam.exam_id
        }));
        setExams(mappedExams);
        setExamResults(resultsData);
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (examData) => {
    try {
      await apiService.createExam(examData);
      fetchData();
      setShowExamModal(false);
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  const handleUpdateExam = async (examData) => {
    try {
      await apiService.updateExam(selectedExam.id, examData);
      fetchData();
      setShowExamModal(false);
      setSelectedExam(null);
    } catch (error) {
      console.error('Error updating exam:', error);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await apiService.deleteExam(examId);
        fetchData();
      } catch (error) {
        console.error('Error deleting exam:', error);
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

  // Student View
  if (isStudent) {
    const upcomingExams = exams.filter(exam => new Date(exam.examDate) >= new Date());
    const completedExams = examResults.filter(result => result.marks !== null);
    const pendingResults = exams.filter(exam => 
      new Date(exam.examDate) < new Date() && 
      !examResults.some(result => result.examId === exam.id)
    );

    const averageMarks = completedExams.length > 0 
      ? completedExams.reduce((sum, result) => sum + result.marks, 0) / completedExams.length 
      : 0;
    
    const passedExams = completedExams.filter(result => result.status === 'pass').length;
    const failedExams = completedExams.filter(result => result.status === 'fail').length;

  return (
    <Layout>
        {/* Student Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Exam Results</h1>
              <p className="text-slate-600 text-lg mt-1">
                View your exam schedule and results
              </p>
            </div>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="gradient" className="animate-slide-up">
            <CardContent padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Average Marks</p>
                  <p className="text-3xl font-bold text-blue-600">{averageMarks.toFixed(1)}%</p>
                  </div>
                <div className="p-4 bg-blue-500 rounded-2xl shadow-lg">
                  <Award className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

          <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '100ms'}}>
            <CardContent padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Passed Exams</p>
                  <p className="text-3xl font-bold text-green-600">{passedExams}</p>
                  </div>
                <div className="p-4 bg-green-500 rounded-2xl shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

          <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '200ms'}}>
            <CardContent padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Upcoming Exams</p>
                  <p className="text-3xl font-bold text-orange-600">{upcomingExams.length}</p>
                  </div>
                <div className="p-4 bg-orange-500 rounded-2xl shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

          <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '300ms'}}>
            <CardContent padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Pending Results</p>
                  <p className="text-3xl font-bold text-purple-600">{pendingResults.length}</p>
                  </div>
                <div className="p-4 bg-purple-500 rounded-2xl shadow-lg">
                  <Clock className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
              {[
                { id: 'schedule', label: 'Exam Schedule', icon: Calendar },
              { id: 'results', label: 'Results', icon: Award }
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

        {/* Exam Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Exams</h2>
            <div className="space-y-4">
              {upcomingExams.map((exam, index) => (
                <Card key={exam.id} variant="elevated" className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                  <CardContent padding="lg">
                    <div className="flex items-center justify-between">
                            <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{exam.subject}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            exam.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            exam.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {exam.status}
                                </span>
                              </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span>{exam.startTime} - {exam.endTime}</span>
                              </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            <span>{exam.room}</span>
                            </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-slate-500" />
                            <span>{exam.maxMarks} marks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Admit Card
                        </Button>
                      </div>
                            </div>
                        </CardContent>
                      </Card>
              ))}
                </div>
            
            {upcomingExams.length === 0 && (
              <Card variant="outline" className="text-center py-12">
                <CardContent>
                  <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No upcoming exams</h3>
                  <p className="text-slate-600">You don't have any scheduled exams at the moment.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Exam Results</h2>
            <div className="space-y-4">
              {completedExams.map((result, index) => (
                <Card key={result.id} variant="elevated" className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                  <CardContent padding="lg">
                    <div className="flex items-center justify-between">
                          <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{result.subject}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            result.status === 'pass' ? 'bg-green-100 text-green-800' :
                            result.status === 'fail' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {result.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Marks Obtained:</span>
                            <span className={`font-semibold ml-2 ${
                              result.status === 'pass' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.marks}/100
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">Grade:</span>
                            <span className="font-semibold ml-2">{result.grade}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Exam Date:</span>
                            <span className="font-semibold ml-2">{new Date(result.examDate).toLocaleDateString()}</span>
                            </div>
                          <div>
                            <span className="text-slate-600">Percentage:</span>
                            <span className="font-semibold ml-2">{result.marks}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Certificate
                              </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

            {completedExams.length === 0 && (
              <Card variant="outline" className="text-center py-12">
                <CardContent>
                  <Award className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No results available</h3>
                  <p className="text-slate-600">Your exam results will appear here once they are published.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Layout>
    );
  }

  // Admin/Staff View
  const scheduledExams = exams.filter(exam => exam.status === 'scheduled');
  const completedExams = exams.filter(exam => exam.status === 'completed');
  const totalStudentsAppeared = examResults.length;
  const averageMarks = examResults.length > 0 
    ? examResults.reduce((sum, result) => sum + result.marks, 0) / examResults.length 
    : 0;

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      {/* Admin/Staff Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Exam Management</h1>
              <p className="text-slate-600 text-lg mt-1">
                Manage exam schedules, conduct exams, and publish results
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={() => setShowExamModal(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Schedule Exam
          </Button>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-4"></div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="gradient" className="animate-slide-up">
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Exams</p>
                <p className="text-3xl font-bold text-blue-600">{exams.length}</p>
              </div>
              <div className="p-4 bg-blue-500 rounded-2xl shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '100ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Scheduled</p>
                <p className="text-3xl font-bold text-orange-600">{scheduledExams.length}</p>
              </div>
              <div className="p-4 bg-orange-500 rounded-2xl shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '200ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Students Appeared</p>
                <p className="text-3xl font-bold text-green-600">{totalStudentsAppeared}</p>
              </div>
              <div className="p-4 bg-green-500 rounded-2xl shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '300ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Average Marks</p>
                <p className="text-3xl font-bold text-purple-600">{averageMarks.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-purple-500 rounded-2xl shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="outline" className="mb-8">
        <CardContent padding="lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search exams..."
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
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      <div className="space-y-4">
        {filteredExams.map((exam, index) => (
          <Card key={exam.id} variant="elevated" className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
            <CardContent padding="lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{exam.subject}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      exam.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      exam.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {exam.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Course:</span>
                      <span className="font-semibold ml-2">{exam.course}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Date:</span>
                      <span className="font-semibold ml-2">{new Date(exam.examDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Time:</span>
                      <span className="font-semibold ml-2">{exam.startTime} - {exam.endTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Room:</span>
                      <span className="font-semibold ml-2">{exam.room}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Max Marks:</span>
                      <span className="font-semibold ml-2">{exam.maxMarks}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowExamModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteExam(exam.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <Card variant="outline" className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No exams found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by scheduling your first exam.'}
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <Button variant="primary" onClick={() => setShowExamModal(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Schedule Exam
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card variant="elevated" className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader variant="gradient">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedExam ? 'Edit Exam' : 'Schedule New Exam'}
                </h3>
                <button
                  onClick={() => {
                    setShowExamModal(false);
                    setSelectedExam(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent padding="lg">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                    <Input placeholder="Enter subject name" defaultValue={selectedExam?.subject} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
                    <Input placeholder="Enter course name" defaultValue={selectedExam?.course} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Exam Date</label>
                    <Input 
                      type="date" 
                      defaultValue={selectedExam?.examDate ? new Date(selectedExam.examDate).toISOString().split('T')[0] : ''} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                    <Input type="time" defaultValue={selectedExam?.startTime} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                    <Input type="time" defaultValue={selectedExam?.endTime} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Room</label>
                    <Input placeholder="Enter room number" defaultValue={selectedExam?.room} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Marks</label>
                    <Input type="number" placeholder="100" defaultValue={selectedExam?.maxMarks} />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowExamModal(false);
                      setSelectedExam(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      if (selectedExam) {
                        handleUpdateExam({});
                      } else {
                        handleCreateExam({});
                      }
                    }}
                  >
                    {selectedExam ? 'Update Exam' : 'Schedule Exam'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
    </Layout>
  );
}