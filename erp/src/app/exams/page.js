'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { mockApi } from '../../services/mockData';
import {
  FileText,
  Calendar,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Plus,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function ExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('results'); // results, schedule, upload
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const isStudent = user?.role === USER_ROLES.STUDENT;
  const canManageExams = [USER_ROLES.ADMIN, USER_ROLES.STAFF].includes(user?.role);

  useEffect(() => {
    loadExamData();
  }, []);

  const loadExamData = async () => {
    try {
      if (isStudent) {
        // Load student's exam results
        const results = await mockApi.getExamResults(user.registrationNumber);
        setExamResults(results);
      } else {
        // Load all exams for admin/staff
        const [examData, resultsData] = await Promise.all([
          mockApi.getExams(),
          mockApi.getExamResults()
        ]);
        setExams(examData);
        setExamResults(resultsData);
      }
    } catch (error) {
      console.error('Error loading exam data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const gradePoints = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 2 };
    const points = gradePoints[grade] || 0;

    if (points >= 9) return 'bg-green-100 text-green-800';
    if (points >= 7) return 'bg-blue-100 text-blue-800';
    if (points >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'absent':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateGPA = (results) => {
    if (results.length === 0) return 0;

    const gradePoints = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 2 };
    const totalPoints = results.reduce((sum, result) => {
      return sum + (gradePoints[result.grade] || 0);
    }, 0);

    return (totalPoints / results.length).toFixed(2);
  };

  const filteredResults = examResults.filter(result => {
    const exam = exams.find(e => e.id === result.examId);
    if (!exam) return false;

    const matchesSearch = exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.course.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSemester = filterSemester === 'all' || exam.semester.toString() === filterSemester;
    const matchesCourse = filterCourse === 'all' || exam.course === filterCourse;

    return matchesSearch && matchesSemester && matchesCourse;
  });

  const getCourses = () => {
    return [...new Set(exams.map(exam => exam.course))];
  };

  const downloadHallTicket = (examId) => {
    // Mock download functionality
    alert(`Downloading hall ticket for exam ${examId}`);
  };

  const downloadResults = () => {
    // Mock download functionality
    alert('Downloading results PDF');
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

  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Examination Portal' }]} />

      {/* Header */}
      <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Examination Portal</h1>
              <p className="text-gray-600 mt-2">
                {isStudent
                  ? 'View your exam results and download hall tickets'
                  : 'Manage exam schedules and upload results'
                }
              </p>
            </div>
            {canManageExams && (
              <div className="flex gap-2">
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Results
                </Button>
                <Button variant="secondary">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exam
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Student Overview Cards */}
        {isStudent && examResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Exams</p>
                    <p className="text-2xl font-bold text-gray-900">{examResults.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Passed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {examResults.filter(r => r.status === 'pass').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Grade</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {examResults.length > 0 ? calculateGPA(examResults) : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Next Exam</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {exams.filter(e => new Date(e.examDate) > new Date()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'results', label: 'Exam Results', icon: FileText },
                { id: 'schedule', label: 'Exam Schedule', icon: Calendar },
                ...(canManageExams ? [{ id: 'upload', label: 'Upload Results', icon: Upload }] : [])
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="inline mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        {activeTab === 'results' && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by subject or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                {!isStudent && (
                  <>
                    <select
                      value={filterSemester}
                      onChange={(e) => setFilterSemester(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Semesters</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem.toString()}>Semester {sem}</option>
                      ))}
                    </select>
                    <select
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Courses</option>
                      {getCourses().map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exam Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {filteredResults.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Exam Results</h2>
                  <Button variant="secondary" onClick={downloadResults}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Results
                  </Button>
                </div>

                <div className="grid gap-4">
                  {filteredResults.map(result => {
                    const exam = exams.find(e => e.id === result.examId);
                    if (!exam) return null;

                    return (
                      <Card key={result.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {exam.subject}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {exam.course} • Semester {exam.semester}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 mt-4 md:mt-0">
                              <div className="text-center">
                                <p className="text-sm text-gray-600">Marks</p>
                                <p className="text-xl font-bold text-gray-900">
                                  {result.marks}/{exam.maxMarks}
                                </p>
                              </div>

                              <div className="text-center">
                                <p className="text-sm text-gray-600">Grade</p>
                                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getGradeColor(result.grade)}`}>
                                  {result.grade}
                                </span>
                              </div>

                              <div className="text-center">
                                <p className="text-sm text-gray-600">Status</p>
                                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(result.status)}`}>
                                  {result.status}
                                </span>
                              </div>

                              {isStudent && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => downloadHallTicket(exam.id)}
                                >
                                  <Download className="mr-1 h-3 w-3" />
                                  Hall Ticket
                                </Button>
                              )}
                            </div>
                          </div>

                          {result.remarks && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                <strong>Remarks:</strong> {result.remarks}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exam results found</h3>
                  <p className="text-gray-600">
                    {searchTerm || filterSemester !== 'all' || filterCourse !== 'all'
                      ? 'Try adjusting your search criteria.'
                      : 'Exam results will appear here once they are published.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Exam Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Exams</h2>

            {exams.filter(exam => exam.status === 'scheduled').length > 0 ? (
              <div className="grid gap-4">
                {exams
                  .filter(exam => exam.status === 'scheduled')
                  .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
                  .map(exam => (
                    <Card key={exam.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {exam.subject}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {exam.course} • Semester {exam.semester} • Room {exam.room}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <Calendar className="inline mr-1 h-4 w-4" />
                              {new Date(exam.examDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Max Marks</p>
                              <p className="text-lg font-semibold text-gray-900">{exam.maxMarks}</p>
                            </div>

                            {isStudent && (
                              <Button
                                variant="secondary"
                                onClick={() => downloadHallTicket(exam.id)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Hall Ticket
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming exams</h3>
                  <p className="text-gray-600">
                    Exam schedules will be published here when available.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Upload Results Tab */}
        {activeTab === 'upload' && canManageExams && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Upload Exam Results</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Results File
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Upload a CSV file containing exam results or enter results manually.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="secondary">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <Button variant="secondary">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Manually
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported format: CSV with columns - Student ID, Subject, Marks, Grade
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </Layout>
  );
}
