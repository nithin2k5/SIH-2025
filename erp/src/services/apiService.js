// API Service for backend integration
// This service will handle all API calls to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // Dashboard
  async getDashboardStats() {
    // Mock data for development - replace with actual API call
    return {
      totalStudents: 1250,
      totalCourses: 45,
      totalFeesCollected: 2450000,
      hostelOccupancy: 85,
      pendingExams: 12,
      recentAdmissions: 23,
      activeUsers: 156
    };
  }

  async getStudentDashboardStats(studentId) {
    // Mock data for development
    return {
      enrolledCourses: 6,
      completedCourses: 4,
      totalFees: 45000,
      paidFees: 35000,
      pendingFees: 10000,
      upcomingExams: 3,
      averageGrade: 3.7,
      attendance: 87
    };
  }

  // Students
  async getStudents(params = {}) {
    // Mock data for development
    return {
      students: [
        {
          id: '1',
          registrationNumber: 'CS2024001',
          name: 'John Doe',
          email: 'john@college.edu',
          phone: '+1234567890',
          course: 'Computer Science',
          department: 'Computer Science',
          semester: 3,
          admissionDate: new Date('2024-01-15'),
          hostelAllocated: true,
          roomNumber: 'A-101',
          status: 'active'
        },
        {
          id: '2',
          registrationNumber: 'ME2024002',
          name: 'Jane Smith',
          email: 'jane@college.edu',
          phone: '+1234567891',
          course: 'Mechanical Engineering',
          department: 'Mechanical Engineering',
          semester: 2,
          admissionDate: new Date('2024-02-01'),
          hostelAllocated: false,
          roomNumber: null,
          status: 'active'
        }
      ],
      total: 1250,
      page: params.page || 1,
      limit: params.limit || 20
    };
  }

  async getStudentById(id) {
    // Mock data for development
    return {
      id,
      registrationNumber: 'CS2024001',
      name: 'John Doe',
      email: 'john@college.edu',
      phone: '+1234567890',
      course: 'Computer Science',
      department: 'Computer Science',
      semester: 3,
      admissionDate: new Date('2024-01-15'),
      hostelAllocated: true,
      roomNumber: 'A-101',
      status: 'active'
    };
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id, studentData) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Courses
  async getCourses(params = {}) {
    // Mock data for development
    return {
      courses: [
        {
          id: '1',
          courseCode: 'CS101',
          courseName: 'Introduction to Computer Science',
          department: 'Computer Science',
          semester: 1,
          credits: 4,
          instructor: 'Dr. Smith',
          maxStudents: 60,
          enrolledStudents: 45,
          status: 'active'
        },
        {
          id: '2',
          courseCode: 'ME201',
          courseName: 'Thermodynamics',
          department: 'Mechanical Engineering',
          semester: 3,
          credits: 3,
          instructor: 'Dr. Johnson',
          maxStudents: 50,
          enrolledStudents: 38,
          status: 'active'
        }
      ],
      total: 45,
      page: params.page || 1,
      limit: params.limit || 20
    };
  }

  async getCourseById(id) {
    return {
      id,
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      department: 'Computer Science',
      semester: 1,
      credits: 4,
      instructor: 'Dr. Smith',
      maxStudents: 60,
      enrolledStudents: 45,
      status: 'active',
      description: 'An introduction to fundamental concepts in computer science.',
      prerequisites: [],
      syllabus: 'Week 1: Introduction...'
    };
  }

  async createCourse(courseData) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id, courseData) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  async registerForCourse(studentId, courseId) {
    return this.request('/course-registrations', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId }),
    });
  }

  async getStudentCourses(studentId) {
    // Mock data for development
    return [
      {
        id: '1',
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        instructor: 'Dr. Smith',
        credits: 4,
        status: 'registered',
        grade: null,
        attendance: 85
      },
      {
        id: '2',
        courseCode: 'MATH201',
        courseName: 'Calculus II',
        instructor: 'Dr. Brown',
        credits: 3,
        status: 'completed',
        grade: 'A',
        attendance: 92
      }
    ];
  }

  // Timetable
  async getTimetable(params = {}) {
    // Mock data for development
    return [
      {
        id: '1',
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        day: 'monday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'CS-101',
        instructor: 'Dr. Smith',
        type: 'lecture'
      },
      {
        id: '2',
        courseCode: 'MATH201',
        courseName: 'Calculus II',
        day: 'tuesday',
        startTime: '11:00',
        endTime: '12:30',
        room: 'MATH-201',
        instructor: 'Dr. Brown',
        type: 'lecture'
      }
    ];
  }

  // Fees
  async getFees(studentId = null) {
    // Mock data for development
    return [
      {
        id: '1',
        studentId: studentId || '1',
        amount: 15000,
        type: 'tuition',
        dueDate: new Date('2024-03-15'),
        status: 'pending',
        description: 'Semester 3 Tuition Fee'
      },
      {
        id: '2',
        studentId: studentId || '1',
        amount: 5000,
        type: 'hostel',
        dueDate: new Date('2024-03-01'),
        status: 'paid',
        paidDate: new Date('2024-02-28'),
        description: 'Hostel Fee - Semester 3'
      }
    ];
  }

  async getFeeStructures() {
    // Mock data for development
    return [
      {
        id: '1',
        course: 'Computer Science',
        semester: 1,
        tuitionFee: 15000,
        hostelFee: 5000,
        examFee: 1000,
        labFee: 2000,
        libraryFee: 500,
        otherFees: 1500,
        totalFee: 25000,
        academicYear: '2024-25'
      }
    ];
  }

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPayments(params = {}) {
    // Mock data for development
    return {
      payments: [
        {
          id: '1',
          studentId: '1',
          studentName: 'John Doe',
          amount: 5000,
          paymentDate: new Date('2024-02-28'),
          paymentMethod: 'online',
          status: 'completed',
          receiptNumber: 'RCP001'
        }
      ],
      total: 1,
      page: params.page || 1,
      limit: params.limit || 20
    };
  }

  // Hostel
  async getHostelRooms(params = {}) {
    // Mock data for development
    return {
      rooms: [
        {
          id: '1',
          roomNumber: 'A-101',
          block: 'A',
          floor: 1,
          capacity: 2,
          occupied: 1,
          status: 'available',
          monthlyRent: 5000,
          amenities: ['WiFi', 'AC', 'Attached Bathroom']
        },
        {
          id: '2',
          roomNumber: 'A-102',
          block: 'A',
          floor: 1,
          capacity: 2,
          occupied: 2,
          status: 'occupied',
          monthlyRent: 5000,
          amenities: ['WiFi', 'AC', 'Attached Bathroom']
        }
      ],
      total: 200,
      page: params.page || 1,
      limit: params.limit || 20
    };
  }

  async allocateRoom(studentId, roomId) {
    return this.request('/hostel/allocate', {
      method: 'POST',
      body: JSON.stringify({ studentId, roomId }),
    });
  }

  async deallocateRoom(studentId) {
    return this.request('/hostel/deallocate', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  }

  // Exams
  async getExams(params = {}) {
    // Mock data for development
    return {
      exams: [
        {
          id: '1',
          subject: 'Introduction to Computer Science',
          course: 'Computer Science',
          semester: 1,
          examDate: new Date('2024-04-15'),
          startTime: '09:00',
          endTime: '12:00',
          room: 'EXAM-HALL-1',
          status: 'scheduled',
          maxMarks: 100,
          passingMarks: 40
        },
        {
          id: '2',
          subject: 'Thermodynamics',
          course: 'Mechanical Engineering',
          semester: 3,
          examDate: new Date('2024-04-18'),
          startTime: '14:00',
          endTime: '17:00',
          room: 'EXAM-HALL-2',
          status: 'scheduled',
          maxMarks: 100,
          passingMarks: 40
        }
      ],
      total: 12,
      page: params.page || 1,
      limit: params.limit || 20
    };
  }

  async getExamResults(studentId = null, examId = null) {
    // Mock data for development
    return [
      {
        id: '1',
        examId: '1',
        studentId: studentId || '1',
        studentName: 'John Doe',
        subject: 'Introduction to Computer Science',
        marks: 85,
        grade: 'A',
        status: 'pass',
        examDate: new Date('2024-04-15')
      },
      {
        id: '2',
        examId: '2',
        studentId: studentId || '1',
        studentName: 'John Doe',
        subject: 'Calculus II',
        marks: 78,
        grade: 'B+',
        status: 'pass',
        examDate: new Date('2024-04-12')
      }
    ];
  }

  async createExam(examData) {
    return this.request('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async updateExam(id, examData) {
    return this.request(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  }

  async deleteExam(id) {
    return this.request(`/exams/${id}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  async getNotifications(userId) {
    // Mock data for development
    return [
      {
        id: '1',
        title: 'Fee Payment Due',
        message: 'Your semester fee payment is due on March 15, 2024.',
        type: 'warning',
        isRead: false,
        createdAt: new Date('2024-03-01'),
        link: '/fees'
      },
      {
        id: '2',
        title: 'Exam Schedule Released',
        message: 'The exam schedule for semester 3 has been released.',
        type: 'info',
        isRead: true,
        createdAt: new Date('2024-02-28'),
        link: '/exams'
      }
    ];
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }
}

export const apiService = new ApiService();

// For backward compatibility, export as mockApi
export const mockApi = apiService;
