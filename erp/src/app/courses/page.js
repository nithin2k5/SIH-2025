'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';
import Layout from '../../components/layout/Layout';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { apiService } from '../../services/apiService';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  User,
  Eye,
  MoreVertical
} from 'lucide-react';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiService.getCourses();
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      await apiService.createCourse(courseData);
      fetchCourses();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleUpdateCourse = async (courseData) => {
    try {
      await apiService.updateCourse(selectedCourse.id, courseData);
      fetchCourses();
      setShowEditModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await apiService.deleteCourse(courseId);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || course.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(courses.map(course => course.department))];

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
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Course Management</h1>
              <p className="text-slate-600 text-lg mt-1">
                Manage courses, schedules, and enrollments
              </p>
            </div>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Course</span>
          </Button>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-4"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="gradient" className="animate-slide-up">
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-slate-900">{courses.length}</p>
              </div>
              <div className="p-4 bg-blue-500 rounded-2xl shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '100ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Active Courses</p>
                <p className="text-3xl font-bold text-slate-900">
                  {courses.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="p-4 bg-green-500 rounded-2xl shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '200ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Enrollments</p>
                <p className="text-3xl font-bold text-slate-900">
                  {courses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0)}
                </p>
              </div>
              <div className="p-4 bg-purple-500 rounded-2xl shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="animate-slide-up" style={{animationDelay: '300ms'}}>
          <CardContent padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Departments</p>
                <p className="text-3xl font-bold text-slate-900">{departments.length}</p>
              </div>
              <div className="p-4 bg-orange-500 rounded-2xl shadow-lg">
                <User className="h-7 w-7 text-white" />
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
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <Card key={course.id} variant="elevated" className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
            <CardHeader variant="gradient" className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {course.courseCode}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      course.status === 'active' ? 'bg-green-100 text-green-800' :
                      course.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2">{course.courseName}</h3>
                  <p className="text-sm text-slate-600">{course.department}</p>
                </div>
                <div className="relative">
                  <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent padding="lg">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Credits:</span>
                    <span className="font-semibold ml-2">{course.credits}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Semester:</span>
                    <span className="font-semibold ml-2">{course.semester}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-slate-600">Instructor:</span>
                  <span className="font-semibold ml-2">{course.instructor}</span>
                </div>

                <div className="text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Enrollment:</span>
                    <span className="font-semibold">
                      {course.enrolledStudents}/{course.maxStudents}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(course.enrolledStudents / course.maxStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card variant="outline" className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filterDepartment !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first course.'}
            </p>
            {(!searchTerm && filterDepartment === 'all') && (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Create Course
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Course Modal would go here */}
      {/* For now, we'll implement this as a separate component in a future iteration */}
    </Layout>
  );
}
