// API Service for Google Apps Script backend integration
// This service handles all API calls through a Next.js proxy to avoid CORS issues
// Now includes localStorage-based mock data functionality

const API_BASE_URL = '/api/proxy'; // Use Next.js API proxy

// Development mode for logging
const DEV_MODE = process.env.NODE_ENV === 'development';

// Use mock data mode (when backend is not available)
const MOCK_MODE = true; // Set to true to use localStorage + mock data

/*
MOCK CREDENTIALS FOR TESTING:

ADMIN ACCOUNTS:
- admin@college.edu / admin123 (John Administrator)
- superadmin@college.edu / admin456 (Sarah SuperAdmin)

STAFF ACCOUNTS:
- admissions@college.edu / staff123 (Michael Thompson - Admissions)
- accounts@college.edu / staff456 (Emily Davis - Accounts)
- exams@college.edu / staff789 (Robert Wilson - Examinations)

HOSTEL WARDEN ACCOUNTS:
- warden@college.edu / warden123 (David Brown)
- hostel@college.edu / warden456 (Lisa Garcia)

STUDENT ACCOUNTS:
- john.doe@college.edu / student123 (John Doe - Computer Science, Sem 3)
- jane.smith@college.edu / student456 (Jane Smith - Electrical Engineering, Sem 2)
- mike.johnson@college.edu / student789 (Mike Johnson - Mechanical Engineering, Sem 4)
- alice.wilson@college.edu / student101 (Alice Wilson - Business Administration, Sem 1)

ROLE-BASED DATA ACCESS:
- Admins: See all data across all modules
- Staff: See admissions, students, courses, fees, exams (department-specific where applicable)
- Hostel Wardens: See hostel rooms/allocations, limited student data
- Students: See only their own data (fees, courses, hostel allocation, exams)
*/

// localStorage keys
const STORAGE_KEYS = {
  STUDENTS: 'erp_students',
  ADMISSIONS: 'erp_admissions',
  COURSES: 'erp_courses',
  EXAMS: 'erp_exams',
  FEES: 'erp_fees',
  FEE_STRUCTURES: 'erp_fee_structures',
  HOSTEL_ROOMS: 'erp_hostel_rooms',
  HOSTEL_ALLOCATIONS: 'erp_hostel_allocations',
  USERS: 'erp_users',
  NOTIFICATIONS: 'erp_notifications',
  PAYMENTS: 'erp_payments',
  RECEIPTS: 'erp_receipts',
  USER_SESSIONS: 'erp_user_sessions'
};

class ApiService {
  constructor() {
    this.currentUser = null;
    this.initializeMockData();
  }

  // Set current user for role-based filtering
  setCurrentUser(user) {
    this.currentUser = user;
  }

  // localStorage utility methods
  getFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      const parsed = data ? JSON.parse(data) : [];
      if (DEV_MODE) {
        console.log(`Retrieved ${parsed.length} items from localStorage key: ${key}`);
      }
      return parsed;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return [];
    }
  }

  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      if (DEV_MODE) {
        console.log(`Saved ${Array.isArray(data) ? data.length : 1} items to localStorage key: ${key}`);
      }
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
      return false;
    }
  }

  addToStorage(key, item) {
    const items = this.getFromStorage(key);
    items.push(item);
    return this.saveToStorage(key, items);
  }

  updateInStorage(key, idField, id, updatedItem) {
    const items = this.getFromStorage(key);
    const index = items.findIndex(item => item[idField] === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedItem };
      return this.saveToStorage(key, items);
    }
    return false;
  }

  deleteFromStorage(key, idField, id) {
    const items = this.getFromStorage(key);
    const filtered = items.filter(item => item[idField] !== id);
    return this.saveToStorage(key, filtered);
  }

  findInStorage(key, idField, id) {
    const items = this.getFromStorage(key);
    return items.find(item => item[idField] === id);
  }

  // Mock data generators
  initializeMockData() {
    if (MOCK_MODE && typeof window !== 'undefined') {
      try {
        console.log('Initializing mock data...');
        // Initialize with sample data if empty
        if (this.getFromStorage(STORAGE_KEYS.STUDENTS).length === 0) {
          console.log('Initializing sample students...');
          this.initializeSampleStudents();
        }
        if (this.getFromStorage(STORAGE_KEYS.ADMISSIONS).length === 0) {
          console.log('Initializing sample admissions...');
          this.initializeSampleAdmissions();
        }
        if (this.getFromStorage(STORAGE_KEYS.COURSES).length === 0) {
          console.log('Initializing sample courses...');
          this.initializeSampleCourses();
        }
        if (this.getFromStorage(STORAGE_KEYS.EXAMS).length === 0) {
          console.log('Initializing sample exams...');
          this.initializeSampleExams();
        }
        if (this.getFromStorage(STORAGE_KEYS.USERS).length === 0) {
          console.log('Initializing sample users...');
          this.initializeSampleUsers();
        }
        if (this.getFromStorage(STORAGE_KEYS.HOSTEL_ROOMS).length === 0) {
          console.log('Initializing sample hostel rooms...');
          this.initializeSampleHostelRooms();
        }
        if (this.getFromStorage(STORAGE_KEYS.FEE_STRUCTURES).length === 0) {
          console.log('Initializing sample fee structures...');
          this.initializeSampleFeeStructures();
        }
        console.log('Mock data initialization complete');
      } catch (error) {
        console.error('Error initializing mock data:', error);
      }
    }
  }

  initializeSampleStudents() {
    const students = [
      {
        id: 'STUDENT001',
        student_id: 'STUDENT001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@college.edu',
        phone: '+1234567890',
        date_of_birth: '2000-01-15',
        address: '123 Main St, City, State',
        programme: 'Computer Science',
        semester: 3,
        enrollment_date: '2023-08-01',
        status: 'active',
        gpa: 3.7
      },
      {
        id: 'STUDENT002',
        student_id: 'STUDENT002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@college.edu',
        phone: '+1234567891',
        date_of_birth: '2001-03-22',
        address: '456 Oak Ave, City, State',
        programme: 'Electrical Engineering',
        semester: 2,
        enrollment_date: '2023-08-01',
        status: 'active',
        gpa: 3.9
      },
      {
        id: 'STUDENT003',
        student_id: 'STUDENT003',
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike.johnson@college.edu',
        phone: '+1234567892',
        date_of_birth: '1999-11-08',
        address: '789 Pine Rd, City, State',
        programme: 'Mechanical Engineering',
        semester: 4,
        enrollment_date: '2022-08-01',
        status: 'active',
        gpa: 3.5
      },
      {
        id: 'STUDENT004',
        student_id: 'STUDENT004',
        first_name: 'Alice',
        last_name: 'Wilson',
        email: 'alice.wilson@college.edu',
        phone: '+1234567893',
        date_of_birth: '2002-05-10',
        address: '321 Elm St, City, State',
        programme: 'Business Administration',
        semester: 1,
        enrollment_date: '2024-08-01',
        status: 'active',
        gpa: 3.8
      }
    ];
    this.saveToStorage(STORAGE_KEYS.STUDENTS, students);
  }

  initializeSampleAdmissions() {
    const admissions = [
      {
        admission_id: 'ADM001',
        application_ref: 'ADM001',
        applicant_name: 'Alice Wilson',
        first_name: 'Alice',
        last_name: 'Wilson',
        email: 'alice.wilson@example.com',
        phone: '+1234567893',
        programme_applied: 'Computer Science',
        documents: 'transcript, certificate',
        applied_on: new Date('2024-01-15'),
        status: 'approved',
        assigned_officer_id: 'USER001',
        verifier_notes: 'All documents verified',
        admitted_on: new Date('2024-02-01'),
        student_id: 'STU004'
      },
      {
        admission_id: 'ADM002',
        application_ref: 'ADM002',
        applicant_name: 'Bob Brown',
        first_name: 'Bob',
        last_name: 'Brown',
        email: 'bob.brown@example.com',
        phone: '+1234567894',
        programme_applied: 'Electrical Engineering',
        documents: 'transcript',
        applied_on: new Date('2024-01-20'),
        status: 'pending',
        assigned_officer_id: 'USER001'
      }
    ];
    this.saveToStorage(STORAGE_KEYS.ADMISSIONS, admissions);
  }

  initializeSampleCourses() {
    const courses = [
      {
        course_id: 'CS101',
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        programme: 'Computer Science',
        semester: 1,
        credits: 4,
        max_students: 50,
        instructor: 'Dr. Sarah Davis',
        description: 'Fundamental concepts of computer science'
      },
      {
        course_id: 'CS201',
        courseCode: 'CS201',
        courseName: 'Data Structures and Algorithms',
        programme: 'Computer Science',
        semester: 2,
        credits: 4,
        max_students: 45,
        instructor: 'Dr. Michael Chen',
        description: 'Advanced data structures and algorithm design'
      },
      {
        course_id: 'EE101',
        courseCode: 'EE101',
        courseName: 'Circuit Analysis',
        programme: 'Electrical Engineering',
        semester: 1,
        credits: 3,
        max_students: 40,
        instructor: 'Prof. Lisa Wang',
        description: 'Basic circuit theory and analysis'
      }
    ];
    this.saveToStorage(STORAGE_KEYS.COURSES, courses);
  }

  initializeSampleExams() {
    const exams = [
      {
        exam_id: 'EXAM001',
        subject: 'Introduction to Computer Science',
        course: 'Computer Science',
        course_id: 'CS101',
        semester: 1,
        exam_date: new Date('2024-12-15'),
        startTime: '09:00',
        endTime: '12:00',
        room: 'CS-101',
        status: 'scheduled',
        maxMarks: 100,
        passingMarks: 40
      },
      {
        exam_id: 'EXAM002',
        subject: 'Data Structures and Algorithms',
        course: 'Computer Science',
        course_id: 'CS201',
        semester: 2,
        exam_date: new Date('2024-12-18'),
        startTime: '14:00',
        endTime: '17:00',
        room: 'CS-201',
        status: 'scheduled',
        maxMarks: 100,
        passingMarks: 40
      }
    ];
    this.saveToStorage(STORAGE_KEYS.EXAMS, exams);
  }

  initializeSampleUsers() {
    const users = [
      // Admin Users
      {
        user_id: 'ADMIN001',
        email: 'admin@college.edu',
        password: 'admin123',
        first_name: 'John',
        last_name: 'Administrator',
        role: 'admin',
        status: 'active',
        department: 'Administration',
        created_at: new Date('2023-01-01')
      },
      {
        user_id: 'ADMIN002',
        email: 'superadmin@college.edu',
        password: 'admin456',
        first_name: 'Sarah',
        last_name: 'SuperAdmin',
        role: 'admin',
        status: 'active',
        department: 'IT Administration',
        created_at: new Date('2023-01-01')
      },

      // Staff Users
      {
        user_id: 'STAFF001',
        email: 'admissions@college.edu',
        password: 'staff123',
        first_name: 'Michael',
        last_name: 'Thompson',
        role: 'staff',
        status: 'active',
        department: 'Admissions',
        created_at: new Date('2023-02-01')
      },
      {
        user_id: 'STAFF002',
        email: 'accounts@college.edu',
        password: 'staff456',
        first_name: 'Emily',
        last_name: 'Davis',
        role: 'staff',
        status: 'active',
        department: 'Accounts',
        created_at: new Date('2023-02-01')
      },
      {
        user_id: 'STAFF003',
        email: 'exams@college.edu',
        password: 'staff789',
        first_name: 'Robert',
        last_name: 'Wilson',
        role: 'staff',
        status: 'active',
        department: 'Examinations',
        created_at: new Date('2023-02-01')
      },

      // Hostel Warden Users
      {
        user_id: 'WARDEN001',
        email: 'warden@college.edu',
        password: 'warden123',
        first_name: 'David',
        last_name: 'Brown',
        role: 'hostel_warden',
        status: 'active',
        department: 'Hostel Management',
        created_at: new Date('2023-03-01')
      },
      {
        user_id: 'WARDEN002',
        email: 'hostel@college.edu',
        password: 'warden456',
        first_name: 'Lisa',
        last_name: 'Garcia',
        role: 'hostel_warden',
        status: 'active',
        department: 'Hostel Management',
        created_at: new Date('2023-03-01')
      },

      // Student Users
      {
        user_id: 'STUDENT001',
        email: 'john.doe@college.edu',
        password: 'student123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        status: 'active',
        department: 'Computer Science',
        semester: 3,
        created_at: new Date('2023-08-01')
      },
      {
        user_id: 'STUDENT002',
        email: 'jane.smith@college.edu',
        password: 'student456',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'student',
        status: 'active',
        department: 'Electrical Engineering',
        semester: 2,
        created_at: new Date('2023-08-01')
      },
      {
        user_id: 'STUDENT003',
        email: 'mike.johnson@college.edu',
        password: 'student789',
        first_name: 'Mike',
        last_name: 'Johnson',
        role: 'student',
        status: 'active',
        department: 'Mechanical Engineering',
        semester: 4,
        created_at: new Date('2022-08-01')
      },
      {
        user_id: 'STUDENT004',
        email: 'alice.wilson@college.edu',
        password: 'student101',
        first_name: 'Alice',
        last_name: 'Wilson',
        role: 'student',
        status: 'active',
        department: 'Business Administration',
        semester: 1,
        created_at: new Date('2024-08-01')
      }
    ];
    this.saveToStorage(STORAGE_KEYS.USERS, users);
  }

  initializeSampleHostelRooms() {
    const rooms = [
      {
        room_id: 'ROOM001',
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
        room_id: 'ROOM002',
        roomNumber: 'A-102',
        block: 'A',
        floor: 1,
        capacity: 2,
        occupied: 2,
        status: 'occupied',
        monthlyRent: 5000,
        amenities: ['WiFi', 'AC', 'Attached Bathroom']
      }
    ];
    this.saveToStorage(STORAGE_KEYS.HOSTEL_ROOMS, rooms);
  }

  initializeSampleFeeStructures() {
    const structures = [
      {
        id: 'STRUCT001',
        course: 'Computer Science',
        semester: 1,
        tuitionFee: 15000,
        hostelFee: 5000,
        examFee: 1000,
        labFee: 2000,
        libraryFee: 500,
        otherFees: 1500,
        totalFee: 25000,
        academicYear: '2024-25',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'STRUCT002',
        course: 'Computer Science',
        semester: 2,
        tuitionFee: 16000,
        hostelFee: 5200,
        examFee: 1100,
        labFee: 2100,
        libraryFee: 550,
        otherFees: 1600,
        totalFee: 26550,
        academicYear: '2024-25',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'STRUCT003',
        course: 'Electrical Engineering',
        semester: 1,
        tuitionFee: 15500,
        hostelFee: 5100,
        examFee: 1050,
        labFee: 2500,
        libraryFee: 525,
        otherFees: 1550,
        totalFee: 26225,
        academicYear: '2024-25',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'STRUCT004',
        course: 'Mechanical Engineering',
        semester: 1,
        tuitionFee: 15800,
        hostelFee: 5150,
        examFee: 1080,
        labFee: 2800,
        libraryFee: 530,
        otherFees: 1580,
        totalFee: 26940,
        academicYear: '2024-25',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'STRUCT005',
        course: 'Business Administration',
        semester: 1,
        tuitionFee: 14000,
        hostelFee: 4800,
        examFee: 950,
        labFee: 1500,
        libraryFee: 475,
        otherFees: 1400,
        totalFee: 23125,
        academicYear: '2024-25',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.saveToStorage(STORAGE_KEYS.FEE_STRUCTURES, structures);
  }

  async request(endpoint, options = {}) {
    if (MOCK_MODE) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.handleMockRequest(endpoint, options);
    }
    // Build URL for the Next.js proxy
    const pathParam = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const url = new URL(API_BASE_URL, window.location.origin);
    url.searchParams.set('path', pathParam);

    // Add query parameters for GET requests
    if (options.params && (!options.method || options.method === 'GET')) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      });
    }

    if (DEV_MODE) {
      console.log(`Making API request to: ${url.toString()}`);
      console.log('Request options:', options);
      console.log('Endpoint:', endpoint);
      console.log('Path param:', pathParam);
    }

    // Configure request
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add body for POST/PUT requests
    if (options.body && (options.method === 'POST' || options.method === 'PUT')) {
      config.body = options.body;
    }

    try {
      const response = await fetch(url.toString(), config);
      
      if (DEV_MODE) {
        console.log(`Response status: ${response.status}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (DEV_MODE) {
        console.log('Response data:', data);
      }
      
      // Handle proxy response format
      if (data && typeof data === 'object') {
        // If it has an error, throw it
        if (data.error) {
          throw new Error(data.error);
        }

        // If it has the GAS wrapper format, return the data property
        if (data.status && data.data) {
          if (DEV_MODE) {
            console.log('Returning GAS wrapper data:', data.data);
          }
          return data.data;
        }

        // Otherwise return the data as-is
        if (DEV_MODE) {
          console.log('Returning data as-is:', data);
        }
        return data;
      }
      
      return data;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Mock request handler
  handleMockRequest(endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    if (DEV_MODE) {
      console.log(`Mock request: ${method} ${endpoint}`, body);
    }

    // Route to appropriate mock handler based on endpoint
    if (endpoint.includes('/auth/')) {
      return this.handleAuthMock(endpoint, method, body, options);
    } else if (endpoint.includes('/students')) {
      return this.handleStudentsMock(endpoint, method, body, options);
    } else if (endpoint.includes('/admissions')) {
      return this.handleAdmissionsMock(endpoint, method, body, options);
    } else if (endpoint.includes('/courses')) {
      return this.handleCoursesMock(endpoint, method, body, options);
    } else if (endpoint.includes('/course-registrations')) {
      return this.handleCourseRegistrationsMock(endpoint, method, body, options);
    } else if (endpoint.includes('/exams')) {
      return this.handleExamsMock(endpoint, method, body, options);
    } else if (endpoint.includes('/fees')) {
      return this.handleFeesMock(endpoint, method, body, options);
    } else if (endpoint.includes('/hostel')) {
      return this.handleHostelMock(endpoint, method, body, options);
    } else if (endpoint.includes('/users')) {
      return this.handleUsersMock(endpoint, method, body, options);
    } else if (endpoint.includes('/notifications')) {
      return this.handleNotificationsMock(endpoint, method, body, options);
    } else if (endpoint.includes('/dashboard')) {
      return this.handleDashboardMock(endpoint, method, body, options);
    }

    // Default mock response
    return { status: 200, data: { success: true, message: 'Mock endpoint not implemented' } };
  }

  // Mock handlers for different endpoints
  handleAuthMock(endpoint, method, body, options) {
    if (endpoint.includes('/login')) {
      if (method === 'POST' && body) {
        let users = this.getFromStorage(STORAGE_KEYS.USERS);

        // Check if users data is valid (should have at least admin user)
        const hasValidUsers = users.length > 0 && users.some(u => u.role === 'admin' && u.email === 'admin@college.edu');

        if (!hasValidUsers) {
          console.log('Invalid or missing user data, re-initializing users...');
          this.initializeSampleUsers();
          users = this.getFromStorage(STORAGE_KEYS.USERS);
        }

        const user = users.find(u => u.email === body.email && u.password === body.password);

        if (user) {
          // Create session
          const session = {
            id: user.user_id,
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            logged_in_at: new Date()
          };
          localStorage.setItem('current_user', JSON.stringify(session));

          return {
            success: true,
            user: session,
            token: 'mock-jwt-token-' + user.user_id
          };
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } else if (endpoint.includes('/logout')) {
      localStorage.removeItem('current_user');
      return { success: true, message: 'Logged out successfully' };
    } else if (endpoint.includes('/me') || endpoint.includes('/profile')) {
      const session = localStorage.getItem('current_user');
      if (session) {
        const user = JSON.parse(session);
        return { success: true, user };
      } else {
        throw new Error('Not authenticated');
      }
    }
    throw new Error('Auth endpoint not found');
  }

  handleStudentsMock(endpoint, method, body, options) {
    const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
    const params = Object.fromEntries(urlParams);

    // Extract ID from endpoint for individual operations
    const idMatch = endpoint.match(/\/students\/([^/?]+)/);
    const studentId = idMatch ? idMatch[1] : null;

    if (method === 'GET') {
      if (studentId) {
        // Get single student
        const student = this.findInStorage(STORAGE_KEYS.STUDENTS, 'student_id', studentId);
        if (student) {
          return { student };
        }
        throw new Error('Student not found');
      } else {
        // Get all students with filters
        let students = this.getFromStorage(STORAGE_KEYS.STUDENTS);

        // Apply role-based filtering
        students = this.filterDataByRole(students, this.currentUser, 'students');

        // Apply filters
        if (params.programme) {
          students = students.filter(s => s.programme === params.programme);
        }
        if (params.semester) {
          students = students.filter(s => s.semester === parseInt(params.semester));
        }
        if (params.status) {
          students = students.filter(s => s.status === params.status);
        }

        // Pagination
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 20;
        const startIndex = (page - 1) * limit;
        const paginatedStudents = students.slice(startIndex, startIndex + limit);

        return {
          students: paginatedStudents,
          total: students.length,
          page,
          limit
        };
      }
    } else if (method === 'POST') {
      const newStudent = {
        ...body,
        id: body.student_id || `STU${Date.now().toString().slice(-6)}`,
        student_id: body.student_id || `STU${Date.now().toString().slice(-6)}`,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.addToStorage(STORAGE_KEYS.STUDENTS, newStudent);
      return { success: true, student: newStudent };
    } else if (method === 'PUT' && studentId) {
      const updatedStudent = {
        ...body,
        updated_at: new Date()
      };
      const success = this.updateInStorage(STORAGE_KEYS.STUDENTS, 'student_id', studentId, updatedStudent);
      if (success) {
        const student = this.findInStorage(STORAGE_KEYS.STUDENTS, 'student_id', studentId);
        return { success: true, student };
      }
      throw new Error('Student not found');
    } else if (method === 'DELETE' && studentId) {
      const success = this.deleteFromStorage(STORAGE_KEYS.STUDENTS, 'student_id', studentId);
      if (success) {
        return { success: true, message: 'Student deleted successfully' };
      }
      throw new Error('Student not found');
    }

    throw new Error('Students endpoint not found');
  }

  handleAdmissionsMock(endpoint, method, body, options) {
    // Extract ID from endpoint for individual operations
    const idMatch = endpoint.match(/\/admissions(?:\/([^/?]+))?/);
    const admissionId = idMatch && idMatch[1] ? idMatch[1] : null;

    if (method === 'GET') {
      if (admissionId) {
        // Get single admission
        const admission = this.findInStorage(STORAGE_KEYS.ADMISSIONS, 'admission_id', admissionId);
        if (admission) {
          return { admission };
        }
        throw new Error('Admission not found');
      } else {
        let admissions = this.getFromStorage(STORAGE_KEYS.ADMISSIONS);

        // Apply role-based filtering
        admissions = this.filterDataByRole(admissions, this.currentUser, 'admissions');

        // Apply filters if provided in options.params
        if (options.params) {
          if (options.params.status) {
            admissions = admissions.filter(a => a.status === options.params.status);
          }
          if (options.params.programme_applied) {
            admissions = admissions.filter(a => a.programme_applied === options.params.programme_applied);
          }
        }

        return {
          admissions: admissions,
          total: admissions.length
        };
      }
    } else if (method === 'POST' && endpoint.includes('/create')) {
      const newAdmission = {
        ...body,
        admission_id: `ADM${Date.now().toString().slice(-6)}`,
        application_ref: `ADM${Date.now().toString().slice(-6)}`,
        applied_on: new Date(),
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };
      this.addToStorage(STORAGE_KEYS.ADMISSIONS, newAdmission);
      return { success: true, admission: newAdmission };
    } else if (method === 'POST' && endpoint.includes('/update-status') && body.admission_id) {
      const updatedAdmission = {
        status: body.status,
        verifier_notes: body.verifier_notes,
        assigned_officer_id: body.assigned_officer_id,
        updated_at: new Date()
      };
      const success = this.updateInStorage(STORAGE_KEYS.ADMISSIONS, 'admission_id', body.admission_id, updatedAdmission);
      if (success) {
        const admission = this.findInStorage(STORAGE_KEYS.ADMISSIONS, 'admission_id', body.admission_id);
        return { success: true, admission };
      }
      throw new Error('Admission not found');
    } else if (method === 'POST' && endpoint.includes('/delete') && body.admission_id) {
      const success = this.deleteFromStorage(STORAGE_KEYS.ADMISSIONS, 'admission_id', body.admission_id);
      if (success) {
        return { success: true, message: 'Admission deleted successfully' };
      }
      throw new Error('Admission not found');
    }

    throw new Error('Admissions endpoint not found');
  }

  handleCoursesMock(endpoint, method, body, options) {
    // Extract ID from endpoint for individual operations
    const idMatch = endpoint.match(/\/courses(?:\/([^/?]+))?/);
    const courseId = idMatch && idMatch[1] ? idMatch[1] : null;

    if (method === 'GET') {
      if (courseId) {
        // Get single course
        const course = this.findInStorage(STORAGE_KEYS.COURSES, 'course_id', courseId);
        if (course) {
          return { course };
        }
        throw new Error('Course not found');
      } else {
        let courses = this.getFromStorage(STORAGE_KEYS.COURSES);
        return {
          courses: courses,
          total: courses.length
        };
      }
    } else if (method === 'POST' && endpoint.includes('/create')) {
      const newCourse = {
        ...body,
        course_id: body.course_id || `CRS${Date.now().toString().slice(-6)}`,
        courseCode: body.courseCode || body.course_id,
        courseName: body.courseName || body.name,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.addToStorage(STORAGE_KEYS.COURSES, newCourse);
      return { success: true, course: newCourse };
    } else if (method === 'POST' && endpoint.includes('/update') && body.course_id) {
      const updatedCourse = {
        ...body,
        updated_at: new Date()
      };
      const success = this.updateInStorage(STORAGE_KEYS.COURSES, 'course_id', body.course_id, updatedCourse);
      if (success) {
        const course = this.findInStorage(STORAGE_KEYS.COURSES, 'course_id', body.course_id);
        return { success: true, course };
      }
      throw new Error('Course not found');
    } else if (method === 'POST' && endpoint.includes('/delete') && body.course_id) {
      const success = this.deleteFromStorage(STORAGE_KEYS.COURSES, 'course_id', body.course_id);
      if (success) {
        return { success: true, message: 'Course deleted successfully' };
      }
      throw new Error('Course not found');
    }

    throw new Error('Courses endpoint not found');
  }

  handleCourseRegistrationsMock(endpoint, method, body, options) {
    if (method === 'POST' && body) {
      // Register student for course
      const { studentId, courseId } = body;

      // Find the course
      const courses = this.getFromStorage(STORAGE_KEYS.COURSES);
      const course = courses.find(c => c.course_id === courseId || c.id === courseId);

      if (!course) {
        throw new Error('Course not found');
      }

      // Find the student
      const students = this.getFromStorage(STORAGE_KEYS.STUDENTS);
      const studentIndex = students.findIndex(s => s.student_id === studentId);

      if (studentIndex === -1) {
        throw new Error('Student not found');
      }

      // Add course to student's enrolled courses
      const enrolledCourse = {
        id: `ENROLLED_${courseId}_${Date.now()}`,
        course_id: course.course_id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        instructor: course.instructor,
        credits: course.credits,
        status: 'registered',
        grade: null,
        attendance: 0
      };

      if (!students[studentIndex].enrolled_courses) {
        students[studentIndex].enrolled_courses = [];
      }

      // Check if already enrolled
      const alreadyEnrolled = students[studentIndex].enrolled_courses.some(
        ec => ec.course_id === courseId
      );

      if (alreadyEnrolled) {
        throw new Error('Already enrolled in this course');
      }

      students[studentIndex].enrolled_courses.push(enrolledCourse);
      this.saveToStorage(STORAGE_KEYS.STUDENTS, students);

      return { success: true, message: 'Course registration successful' };
    }

    throw new Error('Course registration endpoint not found');
  }

  handleExamsMock(endpoint, method, body, options) {
    // Extract ID from endpoint for individual operations
    const idMatch = endpoint.match(/\/exams(?:\/([^/?]+))?/);
    const examId = idMatch && idMatch[1] ? idMatch[1] : null;

    if (method === 'GET') {
      if (examId) {
        // Get single exam
        const exam = this.findInStorage(STORAGE_KEYS.EXAMS, 'exam_id', examId);
        if (exam) {
          return { exam };
        }
        throw new Error('Exam not found');
      } else {
        let exams = this.getFromStorage(STORAGE_KEYS.EXAMS);
        return {
          exams: exams,
          total: exams.length
        };
      }
    } else if (method === 'POST' && endpoint.includes('/create')) {
      const newExam = {
        ...body,
        exam_id: body.exam_id || `EXAM${Date.now().toString().slice(-6)}`,
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date()
      };
      this.addToStorage(STORAGE_KEYS.EXAMS, newExam);
      return { success: true, exam: newExam };
    } else if (method === 'POST' && endpoint.includes('/update') && body.exam_id) {
      const updatedExam = {
        ...body,
        updated_at: new Date()
      };
      const success = this.updateInStorage(STORAGE_KEYS.EXAMS, 'exam_id', body.exam_id, updatedExam);
      if (success) {
        const exam = this.findInStorage(STORAGE_KEYS.EXAMS, 'exam_id', body.exam_id);
        return { success: true, exam };
      }
      throw new Error('Exam not found');
    } else if (method === 'POST' && endpoint.includes('/delete') && body.exam_id) {
      const success = this.deleteFromStorage(STORAGE_KEYS.EXAMS, 'exam_id', body.exam_id);
      if (success) {
        return { success: true, message: 'Exam deleted successfully' };
      }
      throw new Error('Exam not found');
    }

    throw new Error('Exams endpoint not found');
  }

  handleFeesMock(endpoint, method, body, options) {
    if (method === 'GET') {
      if (endpoint.includes('/structures')) {
        // Get fee structures from storage
        const structures = this.getFromStorage(STORAGE_KEYS.FEE_STRUCTURES);
        return { structures };
      } else {
        // Get fees data with role-based filtering
        let fees = [
          {
            id: 'FEE001',
            studentId: 'STUDENT001',
            studentName: 'John Doe',
            amount: 15000,
            type: 'tuition',
            dueDate: new Date('2024-03-15'),
            status: 'pending',
            description: 'Semester 3 Tuition Fee'
          },
          {
            id: 'FEE002',
            studentId: 'STUDENT001',
            studentName: 'John Doe',
            amount: 5000,
            type: 'hostel',
            dueDate: new Date('2024-03-01'),
            status: 'paid',
            paidDate: new Date('2024-02-28'),
            receiptNumber: 'REC001',
            description: 'Hostel Fee - Semester 3'
          },
          {
            id: 'FEE003',
            studentId: 'STUDENT002',
            studentName: 'Jane Smith',
            amount: 15000,
            type: 'tuition',
            dueDate: new Date('2024-03-15'),
            status: 'pending',
            description: 'Semester 2 Tuition Fee'
          },
          {
            id: 'FEE004',
            studentId: 'STUDENT002',
            studentName: 'Jane Smith',
            amount: 2000,
            type: 'exam',
            dueDate: new Date('2024-03-10'),
            status: 'paid',
            paidDate: new Date('2024-03-05'),
            receiptNumber: 'REC002',
            description: 'Exam Fee - Semester 2'
          },
          {
            id: 'FEE005',
            studentId: 'STUDENT003',
            studentName: 'Mike Johnson',
            amount: 18000,
            type: 'tuition',
            dueDate: new Date('2024-03-15'),
            status: 'pending',
            description: 'Semester 4 Tuition Fee'
          },
          {
            id: 'FEE006',
            studentId: 'STUDENT004',
            studentName: 'Alice Wilson',
            amount: 12000,
            type: 'tuition',
            dueDate: new Date('2024-03-15'),
            status: 'paid',
            paidDate: new Date('2024-02-20'),
            receiptNumber: 'REC003',
            description: 'Semester 1 Tuition Fee'
          }
        ];

        // Apply role-based filtering
        fees = this.filterDataByRole(fees, this.currentUser, 'fees');

        // If student ID is provided in params, filter by student
        if (options.params && options.params.studentId) {
          fees = fees.filter(fee => fee.studentId === options.params.studentId);
        }

        return { fees };
      }
    } else if (method === 'POST' && endpoint.includes('/structures')) {
      // Create new fee structure
      const newStructure = {
        ...body,
        id: `STRUCT${Date.now().toString().slice(-6)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add to existing structures
      const existingStructures = this.getFromStorage(STORAGE_KEYS.FEE_STRUCTURES) || [];
      existingStructures.push(newStructure);
      this.saveToStorage(STORAGE_KEYS.FEE_STRUCTURES, existingStructures);

      return { success: true, structure: newStructure };
    }

    throw new Error('Fees endpoint not found');
  }

  handleHostelMock(endpoint, method, body, options) {
    if (endpoint.includes('/rooms') && method === 'GET') {
      const rooms = this.getFromStorage(STORAGE_KEYS.HOSTEL_ROOMS);
      return {
        rooms: rooms,
        total: rooms.length
      };
    } else if (endpoint.includes('/create-room') && method === 'POST') {
      const newRoom = {
        ...body,
        room_id: body.room_id || `ROOM${Date.now().toString().slice(-6)}`,
        status: 'available',
        created_at: new Date(),
        updated_at: new Date()
      };
      this.addToStorage(STORAGE_KEYS.HOSTEL_ROOMS, newRoom);
      return { success: true, room: newRoom };
    } else if (endpoint.includes('/update-room') && method === 'POST' && body.room_id) {
      const updatedRoom = {
        ...body,
        updated_at: new Date()
      };
      const success = this.updateInStorage(STORAGE_KEYS.HOSTEL_ROOMS, 'room_id', body.room_id, updatedRoom);
      if (success) {
        const room = this.findInStorage(STORAGE_KEYS.HOSTEL_ROOMS, 'room_id', body.room_id);
        return { success: true, room };
      }
      throw new Error('Room not found');
    } else if (endpoint.includes('/allocations') && method === 'GET') {
      let allocations = this.getFromStorage(STORAGE_KEYS.HOSTEL_ALLOCATIONS);

      // Apply role-based filtering
      allocations = this.filterDataByRole(allocations, this.currentUser, 'hostel_allocations');

      return {
        allocations: allocations,
        total: allocations.length
      };
    } else if (endpoint.includes('/allocate') && method === 'POST') {
      // Mock allocation
      const allocation = {
        alloc_id: `ALLOC${Date.now().toString().slice(-6)}`,
        ...body,
        allocated_on: new Date(),
        status: 'active'
      };
      this.addToStorage(STORAGE_KEYS.HOSTEL_ALLOCATIONS, allocation);
      return { success: true, allocation };
    } else if (endpoint.includes('/deallocate') && method === 'POST') {
      if (body.delete_room && body.room_id) {
        // Delete room
        const success = this.deleteFromStorage(STORAGE_KEYS.HOSTEL_ROOMS, 'room_id', body.room_id);
        if (success) {
          return { success: true, message: 'Room deleted successfully' };
        }
        throw new Error('Room not found');
      } else if (body.student_id) {
        // Deallocate student
        const allocations = this.getFromStorage(STORAGE_KEYS.HOSTEL_ALLOCATIONS);
        const allocation = allocations.find(a => a.student_id === body.student_id && a.status === 'active');
        if (allocation) {
          const updatedAllocation = {
            ...allocation,
            status: 'inactive',
            deallocated_on: new Date(),
            reason: body.reason || ''
          };
          const success = this.updateInStorage(STORAGE_KEYS.HOSTEL_ALLOCATIONS, 'alloc_id', allocation.alloc_id, updatedAllocation);
          if (success) {
            return { success: true, message: 'Student deallocated successfully' };
          }
        }
        throw new Error('Active allocation not found');
      }
    }

    throw new Error('Hostel endpoint not found');
  }

  handleUsersMock(endpoint, method, body, options) {
    // Extract ID from endpoint for individual operations
    const idMatch = endpoint.match(/\/users(?:\/([^/?]+))?/);
    const userId = idMatch && idMatch[1] ? idMatch[1] : null;

    if (method === 'GET') {
      if (endpoint.includes('/profile') && options.params?.user_id) {
        // Get user profile
        const user = this.findInStorage(STORAGE_KEYS.USERS, 'user_id', options.params.user_id);
        if (user) {
          return { user };
        }
        throw new Error('User not found');
      } else {
        const users = this.getFromStorage(STORAGE_KEYS.USERS);
        return {
          users: users,
          total: users.length
        };
      }
    } else if (method === 'POST' && endpoint.includes('/create')) {
      const newUser = {
        ...body,
        user_id: `USER${Date.now().toString().slice(-6)}`,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };
      this.addToStorage(STORAGE_KEYS.USERS, newUser);
      return { success: true, user: newUser };
    } else if (method === 'POST' && endpoint.includes('/update') && body.user_id) {
      const updatedUser = {
        ...body,
        updated_at: new Date()
      };
      const success = this.updateInStorage(STORAGE_KEYS.USERS, 'user_id', body.user_id, updatedUser);
      if (success) {
        const user = this.findInStorage(STORAGE_KEYS.USERS, 'user_id', body.user_id);
        return { success: true, user };
      }
      throw new Error('User not found');
    } else if (method === 'POST' && endpoint.includes('/delete') && body.user_id) {
      const success = this.deleteFromStorage(STORAGE_KEYS.USERS, 'user_id', body.user_id);
      if (success) {
        return { success: true, message: 'User deleted successfully' };
      }
      throw new Error('User not found');
    }

    throw new Error('Users endpoint not found');
  }

  handleNotificationsMock(endpoint, method, body, options) {
    // Mock notifications
    const notifications = [
      {
        notification_id: 'NOTIF001',
        recipient: 'USER001',
        title: 'New Admission Application',
        message: 'A new admission application has been submitted.',
        type: 'admission',
        read: false,
        created_at: new Date()
      }
    ];
    return {
      notifications: notifications,
      total: notifications.length
    };
  }

  handleDashboardMock(endpoint, method, body, options) {
    if (endpoint.includes('/stats')) {
      const students = this.getFromStorage(STORAGE_KEYS.STUDENTS);
      const admissions = this.getFromStorage(STORAGE_KEYS.ADMISSIONS);
      const courses = this.getFromStorage(STORAGE_KEYS.COURSES);
      const exams = this.getFromStorage(STORAGE_KEYS.EXAMS);
      const users = this.getFromStorage(STORAGE_KEYS.USERS);

      return {
        totalStudents: students.length,
        totalCourses: courses.length,
        totalAdmissions: admissions.length,
        totalFeesCollected: 150000,
        hostelOccupancy: 75,
        pendingExams: exams.length,
        activeUsers: users.length,
        totalAdmissions: admissions.length
      };
    }

    throw new Error('Dashboard endpoint not found');
  }

  // Role-based data filtering
  filterDataByRole(data, user, dataType) {
    if (!user || !Array.isArray(data)) return data;

    const { role, id } = user;

    switch (dataType) {
      case 'admissions':
        // Staff and Admin can see all admissions
        // Students cannot access admissions
        if (role === 'student') return [];
        return data;

      case 'students':
        // Admin and Staff can see all students
        // Students can only see their own data
        if (role === 'student') {
          return data.filter(student => student.student_id === user.user_id);
        }
        return data;

      case 'courses':
        // All roles can see courses (for enrollment/viewing)
        return data;

      case 'exams':
        // Students can see all exams (for their courses)
        // Staff/Admin can see all exams
        return data;

      case 'fees':
        // Students can only see their own fees
        // Staff/Admin can see all fees
        if (role === 'student') {
          return data.filter(fee => fee.studentId === user.user_id);
        }
        return data;

      case 'hostel_rooms':
        // Students can see rooms (for allocation)
        // Hostel wardens can see all rooms
        // Admin can see all rooms
        return data;

      case 'hostel_allocations':
        // Students can only see their own allocations
        // Hostel wardens can see all allocations
        // Admin can see all allocations
        if (role === 'student') {
          return data.filter(allocation => allocation.student_id === user.user_id);
        }
        return data;

      default:
        return data;
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
    try {
      // Use mock data from localStorage
      const students = this.getFromStorage(STORAGE_KEYS.STUDENTS);
      const admissions = this.getFromStorage(STORAGE_KEYS.ADMISSIONS);
      const courses = this.getFromStorage(STORAGE_KEYS.COURSES);
      const exams = this.getFromStorage(STORAGE_KEYS.EXAMS);
      const users = this.getFromStorage(STORAGE_KEYS.USERS);

      if (DEV_MODE) {
        console.log('Dashboard stats from localStorage:', { students, admissions, courses, exams, users });
      }

      return {
        totalStudents: students.length,
        totalCourses: courses.length,
        totalFeesCollected: 150000,
        hostelOccupancy: 75,
        pendingExams: exams.length,
        recentAdmissions: admissions.length,
        activeUsers: users.length,
        totalAdmissions: admissions.length
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default stats object to prevent UI errors
      return {
        totalStudents: 0,
        totalCourses: 0,
        totalFeesCollected: 0,
        hostelOccupancy: 0,
        pendingExams: 0,
        recentAdmissions: 0,
        activeUsers: 0,
        totalAdmissions: 0
      };
    }
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
    return this.request('/students', { params });
  }

  async getStudentById(id) {
    return this.request(`/students/${id}`);
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
    // Use mock data from localStorage
    let courses = this.getFromStorage(STORAGE_KEYS.COURSES);

    // Apply filters if provided
    if (params.programme) {
      courses = courses.filter(c => c.programme === params.programme);
    }
    if (params.semester) {
      courses = courses.filter(c => c.semester === parseInt(params.semester));
    }

    return { courses };
  }

  async getCourseById(id) {
    return this.request(`/courses/${id}`);
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
    // Get enrolled courses for the student
    // In mock mode, return some default enrolled courses for the logged-in student
    if (this.currentUser && this.currentUser.id === studentId) {
      // Return enrolled courses for the current user
      const students = this.getFromStorage(STORAGE_KEYS.STUDENTS);
      const enrolledCourses = students.find(student => student.student_id === studentId);

      if (enrolledCourses && enrolledCourses.enrolled_courses && enrolledCourses.enrolled_courses.length > 0) {
        return enrolledCourses.enrolled_courses;
      }

      // Return default mock data if no enrolled courses found
      return [];
    }

    // For other students, return empty array (role-based access)
    return [];
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
  async getFees(params = {}) {
    return this.request('/fees', { params });
  }

  async getFeeStructures(params = {}) {
    return this.request('/fees/structures', { params });
  }

  async createFeeStructure(feeStructureData) {
    return this.request('/fees/structures', {
      method: 'POST',
      body: JSON.stringify(feeStructureData),
    });
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

  // Admissions
  async getAdmissions(params = {}) {
    return this.request('/admissions', { params });
  }

  async getMyAdmissions(email) {
    return this.request('/admissions/my', { params: { email } });
  }

  async getAdmissionStats() {
    return this.request('/admissions/stats');
  }

  async createAdmission(admissionData) {
    // Map frontend form data to backend API format
    const apiData = {
      first_name: admissionData.firstName,
      last_name: admissionData.lastName,
      email: admissionData.email,
      phone: admissionData.phone,
      programme_applied: admissionData.course,
      documents: admissionData.documents || ''
    };

    return this.request('/admissions/create', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  async updateAdmission(admissionId, admissionData) {
    const apiData = {
      admission_id: admissionId,
      ...admissionData
    };

    return this.request('/admissions/update', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  async updateAdmissionStatus(admissionId, status, verifierNotes = '', assignedOfficerId = '') {
    return this.request('/admissions/update-status', {
      method: 'POST',
      body: JSON.stringify({
        admission_id: admissionId,
        status,
        verifier_notes: verifierNotes,
        assigned_officer_id: assignedOfficerId
      }),
    });
  }

  async admitStudent(admissionId, studentData) {
    return this.request('/admissions/admit-student', {
      method: 'POST',
      body: JSON.stringify({
        admission_id: admissionId,
        student_data: studentData
      }),
    });
  }

  async deleteAdmission(admissionId) {
    return this.request('/admissions/delete', {
      method: 'POST',
      body: JSON.stringify({ admission_id: admissionId }),
    });
  }

  // User management APIs
  async getUsers(params = {}) {
    return this.request('/users', { params });
  }

  async getUserById(userId) {
    return this.request(`/users/profile`, {
      params: { user_id: userId }
    });
  }

  async createUser(userData) {
    return this.request('/users/create', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.request('/users/update', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...userData
      }),
    });
  }

  async deleteUser(userId) {
    return this.request('/users/delete', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  // Dashboard APIs
  async getSystemHealth() {
    return this.request('/dashboard/health');
  }

  async getRecentActivity(limit = 10) {
    return this.request('/dashboard/activity', {
      params: { limit }
    });
  }

  // Course management APIs
  async createCourse(courseData) {
    return this.request('/courses/create', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(courseId, courseData) {
    return this.request('/courses/update', {
      method: 'POST',
      body: JSON.stringify({
        course_id: courseId,
        ...courseData
      }),
    });
  }

  async deleteCourse(courseId) {
    return this.request('/courses/delete', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
  }

  // Hostel management APIs
  async getHostelRooms(params = {}) {
    return this.request('/hostel/rooms', { params });
  }

  async getHostelAllocations(params = {}) {
    return this.request('/hostel/allocations', { params });
  }

  async allocateHostelRoom(studentId, roomId, allocationData = {}) {
    return this.request('/hostel/allocate', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        room_id: roomId,
        ...allocationData
      }),
    });
  }

  async deallocateHostelRoom(studentId, reason = '') {
    return this.request('/hostel/deallocate', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        reason
      }),
    });
  }

  // Fee management APIs
  async getFeeStructures(params = {}) {
    return this.request('/fees/structures', { params });
  }

  async createPayment(paymentData) {
    return this.request('/fees/payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getReceipts(params = {}) {
    return this.request('/fees/receipts', { params });
  }

  // Exam management APIs
  async createExam(examData) {
    return this.request('/exams/create', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async updateExam(examId, examData) {
    return this.request('/exams/update', {
      method: 'POST',
      body: JSON.stringify({
        exam_id: examId,
        ...examData
      }),
    });
  }

  async deleteExam(examId) {
    return this.request('/exams/delete', {
      method: 'POST',
      body: JSON.stringify({ exam_id: examId }),
    });
  }

  async enterExamMarks(examId, studentId, marksData) {
    return this.request('/exams/marks', {
      method: 'POST',
      body: JSON.stringify({
        exam_id: examId,
        student_id: studentId,
        ...marksData
      }),
    });
  }

  // Notification APIs
  async getNotifications(recipientId) {
    return this.request('/notifications', {
      params: { recipient: recipientId }
    });
  }

  async createNotification(notificationData) {
    return this.request('/notifications/create', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async updateNotification(notificationId, updateData) {
    return this.request('/notifications/update', {
      method: 'POST',
      body: JSON.stringify({
        notification_id: notificationId,
        ...updateData
      }),
    });
  }

  async markNotificationAsRead(notificationId) {
    return this.request('/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ notification_id: notificationId }),
    });
  }
}

export const apiService = new ApiService();

// For backward compatibility, export as mockApi
export const mockApi = apiService;
