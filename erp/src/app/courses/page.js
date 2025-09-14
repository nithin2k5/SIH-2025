'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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

// Validation schema
const courseSchema = yup.object({
  courseCode: yup.string().required('Course code is required'),
  courseName: yup.string().required('Course name is required'),
  credits: yup.number().min(1).max(6).required('Credits are required'),
  programmeId: yup.string().required('Programme ID is required'),
  semester: yup.number().min(1).max(8).required('Semester is required')
});

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form hooks
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors, isSubmitting: isCreateSubmitting },
    reset: resetCreate
  } = useForm({
    resolver: yupResolver(courseSchema),
    mode: 'onChange'
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors, isSubmitting: isEditSubmitting },
    reset: resetEdit,
    setValue: setEditValue
  } = useForm({
    resolver: yupResolver(courseSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...');
      const response = await apiService.getCourses();
      console.log('Raw API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null/undefined');

      // Handle different response formats
      let coursesData = [];
      if (response?.courses && Array.isArray(response.courses)) {
        console.log('Found courses array in response.courses');
        coursesData = response.courses;
      } else if (response?.data?.courses && Array.isArray(response.data.courses)) {
        console.log('Found courses array in response.data.courses');
        coursesData = response.data.courses;
      } else if (Array.isArray(response)) {
        console.log('Response is directly an array');
        coursesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        console.log('Found array in response.data');
        coursesData = response.data;
      } else {
        console.log('No courses array found, using empty array');
        coursesData = [];
      }

      console.log('Final extracted courses data:', coursesData);

      // Map API response to match frontend expectations
      const mappedCourses = Array.isArray(coursesData) ? coursesData.map(course => {
        console.log('Mapping course:', course);
        const mapped = {
          id: course?.course_id || course?.id || '',
          courseName: course?.title || course?.courseName || '',
          courseCode: course?.course_id || course?.courseCode || '',
          credits: course?.credits || 3,
          programmeId: course?.programme_id || course?.programmeId || '',
          semester: course?.semester || 1,
          department: course?.programme_id || course?.programmeId || 'General',
          status: 'active', // Default status since model doesn't have status
          createdAt: course?.created_at || course?.createdAt,
          updatedAt: course?.updated_at || course?.updatedAt
        };
        console.log('Mapped course:', mapped);
        return mapped;
      }) : [];

      console.log('Final mapped courses:', mappedCourses);
      setCourses(mappedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Set empty array instead of showing error to user
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      // Map frontend data to API format (matching Courses model)
      const apiData = {
        course_id: courseData.courseCode,
        title: courseData.courseName,
        credits: parseInt(courseData.credits) || 3,
        programme_id: courseData.programmeId || courseData.department || 'GENERAL',
        semester: parseInt(courseData.semester) || 1
      };

      await apiService.createCourse(apiData);
      fetchCourses();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    }
  };

  const handleUpdateCourse = async (courseData) => {
    try {
      // Map frontend data to API format (matching Courses model)
      const apiData = {
        title: courseData.courseName,
        credits: parseInt(courseData.credits) || 3,
        programme_id: courseData.programmeId || courseData.department || 'GENERAL',
        semester: parseInt(courseData.semester) || 1
      };

      await apiService.updateCourse(selectedCourse.id, apiData);
      fetchCourses();
      setShowEditModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course. Please try again.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await apiService.deleteCourse(courseId);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const filteredCourses = courses.filter(course => {
    // Handle undefined values safely
    const courseName = (course.courseName || course.title || '').toLowerCase();
    const courseCode = (course.courseCode || course.course_id || '').toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch = courseName.includes(searchTermLower) ||
                         courseCode.includes(searchTermLower);
    const matchesDepartment = filterDepartment === 'all' || (course.department === filterDepartment);
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(courses.map(course => course.department || course.programme_id || 'General').filter(Boolean))];

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
                  {courses.length}
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
                      {course.courseCode || course.course_id || 'N/A'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      (course.status || 'active') === 'active' ? 'bg-green-100 text-green-800' :
                      (course.status || 'active') === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {course.status || 'active'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2">{course.courseName || course.title || 'Untitled Course'}</h3>
                  <p className="text-sm text-slate-600">{course.department || course.programme_id || 'General'}</p>
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
                    <span className="font-semibold ml-2">{course.credits || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Semester:</span>
                    <span className="font-semibold ml-2">{course.semester || 'N/A'}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-slate-600">Programme:</span>
                  <span className="font-semibold ml-2">{course.programmeId || course.programme_id || 'N/A'}</span>
                </div>

                <div className="text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Course Status:</span>
                    <span className="font-semibold text-green-600">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Created: {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
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
                        // Populate edit form with course data
                        setEditValue('courseCode', course.courseCode || course.course_id || '');
                        setEditValue('courseName', course.courseName || course.title || '');
                        setEditValue('credits', course.credits || 3);
                        setEditValue('programmeId', course.programmeId || course.programme_id || '');
                        setEditValue('semester', course.semester || 1);
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

      {/* Create/Edit Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900">
                  Add New Course
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <form onSubmit={handleSubmitCreate(handleCreateCourse)} className="space-y-4">
                  <Input
                    label="Course Code"
                    {...registerCreate('courseCode')}
                    error={createErrors.courseCode?.message}
                    placeholder="e.g., CS101"
                  />
                  <Input
                    label="Course Name"
                    {...registerCreate('courseName')}
                    error={createErrors.courseName?.message}
                    placeholder="Enter course title"
                  />
                  <Input
                    label="Credits"
                    type="number"
                    min="1"
                    max="6"
                    {...registerCreate('credits')}
                    error={createErrors.credits?.message}
                    placeholder="Number of credits"
                  />
                  <Input
                    label="Programme ID"
                    {...registerCreate('programmeId')}
                    error={createErrors.programmeId?.message}
                    placeholder="Programme identifier"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      {...registerCreate('semester')}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    >
                      <option value="">Select semester</option>
                      {[1,2,3,4,5,6,7,8].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                    {createErrors.semester && (
                      <p className="text-sm text-red-600 mt-1">{createErrors.semester.message}</p>
                    )}
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      loading={isCreateSubmitting}
                    >
                      Create Course
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && selectedCourse && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader variant="gradient">
                <h3 className="text-xl font-bold text-slate-900">
                  Edit Course
                </h3>
              </CardHeader>
              <CardContent padding="lg">
                <form onSubmit={handleSubmitEdit(handleUpdateCourse)} className="space-y-4">
                  <Input
                    label="Course Code"
                    {...registerEdit('courseCode')}
                    error={editErrors.courseCode?.message}
                    placeholder="e.g., CS101"
                    disabled
                  />
                  <Input
                    label="Course Name"
                    {...registerEdit('courseName')}
                    error={editErrors.courseName?.message}
                    placeholder="Enter course title"
                  />
                  <Input
                    label="Credits"
                    type="number"
                    min="1"
                    max="6"
                    {...registerEdit('credits')}
                    error={editErrors.credits?.message}
                    placeholder="Number of credits"
                  />
                  <Input
                    label="Programme ID"
                    {...registerEdit('programmeId')}
                    error={editErrors.programmeId?.message}
                    placeholder="Programme identifier"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      {...registerEdit('semester')}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    >
                      <option value="">Select semester</option>
                      {[1,2,3,4,5,6,7,8].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                    {editErrors.semester && (
                      <p className="text-sm text-red-600 mt-1">{editErrors.semester.message}</p>
                    )}
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedCourse(null);
                        resetEdit();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      loading={isEditSubmitting}
                    >
                      Update Course
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* For now, we'll implement this as a separate component in a future iteration */}
    </Layout>
  );
}