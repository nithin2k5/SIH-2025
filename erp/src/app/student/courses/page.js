'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES } from '../../../types';
import Layout from '../../../components/layout/Layout';
import Card, { CardContent, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { apiService } from '../../../services/apiService';
import {
  BookOpen,
  Clock,
  MapPin,
  User,
  Calendar,
  GraduationCap,
  Award,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Users
} from 'lucide-react';

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enrolled');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrolledData, availableData, timetableData] = await Promise.all([
          apiService.getStudentCourses(user?.id),
          apiService.getCourses({ available: true }),
          apiService.getTimetable({ studentId: user?.id })
        ]);

        setEnrolledCourses(enrolledData || []);
        // Filter out courses that the student is already enrolled in
        const enrolledCourseIds = (enrolledData || []).map(course => course.course_id || course.id);
        const filteredAvailableCourses = (availableData.courses || []).filter(course =>
          !enrolledCourseIds.includes(course.course_id || course.id)
        );
        setAvailableCourses(filteredAvailableCourses);
        setTimetable(timetableData);
      } catch (error) {
        console.error('Error fetching courses data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCourseRegistration = async (courseId) => {
    try {
      await apiService.registerForCourse(user.id, courseId);

      // Refresh all data
      const [enrolledData, availableData] = await Promise.all([
        apiService.getStudentCourses(user.id),
        apiService.getCourses({ available: true })
      ]);

      setEnrolledCourses(enrolledData || []);
      // Filter out courses that the student is already enrolled in
      const enrolledCourseIds = (enrolledData || []).map(course => course.course_id || course.id);
      const filteredAvailableCourses = (availableData.courses || []).filter(course =>
        !enrolledCourseIds.includes(course.course_id || course.id)
      );
      setAvailableCourses(filteredAvailableCourses);

      // Show success message
      alert('Successfully registered for the course!');
    } catch (error) {
      console.error('Error registering for course:', error);
      alert('Failed to register for the course. Please try again.');
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

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const timeSlots = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'];

  const getTimetableCell = (day, time) => {
    return timetable.find(item => 
      item.day.toLowerCase() === day && item.startTime === time
    );
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">My Courses</h1>
            <p className="text-slate-600 text-lg mt-1">
              Manage your enrolled courses and view timetable
            </p>
          </div>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: 'enrolled', label: 'Enrolled Courses', icon: BookOpen },
            { id: 'available', label: 'Available Courses', icon: Plus },
            { id: 'timetable', label: 'Timetable', icon: Calendar }
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

      {/* Enrolled Courses Tab */}
      {activeTab === 'enrolled' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {enrolledCourses.map((course, index) => (
              <Card key={course.id || course.course_id || index} variant="elevated" className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                <CardHeader variant="gradient" className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {course.courseCode}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          course.status === 'completed' ? 'bg-green-100 text-green-800' :
                          course.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{course.courseName}</h3>
                      <p className="text-sm text-slate-600">Instructor: {course.instructor}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent padding="lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Credits</span>
                      <span className="font-semibold">{course.credits}</span>
                    </div>
                    
                    {course.grade && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Grade</span>
                        <span className="font-semibold text-green-600">{course.grade}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Attendance</span>
                      <span className={`font-semibold ${
                        course.attendance >= 75 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {course.attendance}%
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {course.status === 'registered' && (
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            Drop Course
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses Tab */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {availableCourses.map((course, index) => (
              <Card key={course.course_id || course.id || index} variant="elevated" className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                <CardHeader variant="gradient" className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                          {course.courseCode}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Available
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{course.courseName}</h3>
                      <p className="text-sm text-slate-600">Instructor: {course.instructor}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent padding="lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Credits</span>
                      <span className="font-semibold">{course.credits}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Semester</span>
                      <span className="font-semibold">{course.semester}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Enrolled</span>
                      <span className="font-semibold">
                        {course.enrolledStudents}/{course.maxStudents}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                        style={{ width: `${(course.enrolledStudents / course.maxStudents) * 100}%` }}
                      ></div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleCourseRegistration(course.course_id || course.id)}
                          disabled={course.enrolledStudents >= course.maxStudents}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Register
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Timetable Tab */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader variant="gradient">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <Calendar className="h-6 w-6 mr-3" />
                Weekly Timetable
              </h3>
            </CardHeader>
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 w-24">Time</th>
                      {days.map(day => (
                        <th key={day} className="px-6 py-4 text-center text-sm font-semibold text-slate-700 capitalize">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {timeSlots.map(time => (
                      <tr key={time} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {time}
                        </td>
                        {days.map(day => {
                          const classInfo = getTimetableCell(day, time);
                          return (
                            <td key={`${day}-${time}`} className="px-6 py-4 text-center">
                              {classInfo ? (
                                <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 text-xs">
                                  <div className="font-semibold text-blue-900 mb-1">
                                    {classInfo.courseCode}
                                  </div>
                                  <div className="text-blue-700 mb-1">
                                    {classInfo.courseName}
                                  </div>
                                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                                    <MapPin className="h-3 w-3" />
                                    <span>{classInfo.room}</span>
                                  </div>
                                  <div className="mt-1 text-blue-600">
                                    {classInfo.type}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-16 flex items-center justify-center text-slate-400">
                                  -
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}
