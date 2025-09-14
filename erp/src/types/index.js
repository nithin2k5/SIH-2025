// ERP System Types

export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student',
  HOSTEL_WARDEN: 'hostel_warden'
};

export const MODULES = {
  ADMISSIONS: 'admissions',
  FEES: 'fees',
  HOSTEL: 'hostel',
  EXAMS: 'exams',
  DASHBOARD: 'dashboard'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  PARTIAL: 'partial'
};

export const HOSTEL_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance'
};

export const EXAM_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const ADMISSION_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ADMITTED: 'admitted'
};

// Admission Model - Based on AdmissionsSchema from backend
export const Admission = {
  admission_id: '',
  application_ref: '',
  applicant_name: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  programme_applied: '',
  documents: '',
  applied_on: new Date(),
  status: ADMISSION_STATUS.PENDING,
  assigned_officer_id: '',
  verifier_notes: '',
  admitted_on: null,
  student_id: null,
  created_at: new Date(),
  updated_at: new Date()
};

// User Type
export const User = {
  id: '',
  name: '',
  email: '',
  role: USER_ROLES.STUDENT,
  department: '',
  createdAt: new Date(),
  isActive: true
};

// Student Type
export const Student = {
  id: '',
  registrationNumber: '',
  name: '',
  email: '',
  phone: '',
  course: '',
  department: '',
  semester: 1,
  admissionDate: new Date(),
  hostelAllocated: false,
  roomNumber: null,
  feesPaid: 0,
  totalFees: 0,
  documents: [],
  status: 'active'
};

// Fee Type
export const Fee = {
  id: '',
  studentId: '',
  amount: 0,
  type: 'tuition', // tuition, hostel, exam, other
  dueDate: new Date(),
  paidDate: null,
  status: PAYMENT_STATUS.PENDING,
  paymentMethod: '',
  receiptNumber: ''
};

// Hostel Type
// export const HostelRoom = {
//   id: '',
//   roomNumber: '',
//   block: '',
//   floor: 0,
//   capacity: 2,
//   occupied: 0,
//   status: HOSTEL_STATUS.AVAILABLE,
//   amenities: [],
//   monthlyRent: 0
// };

// Exam Type
export const Exam = {
  id: '',
  subject: '',
  course: '',
  semester: 1,
  examDate: new Date(),
  room: '',
  status: EXAM_STATUS.SCHEDULED,
  maxMarks: 100,
  passingMarks: 40
};

// Exam Result Type
export const ExamResult = {
  id: '',
  examId: '',
  studentId: '',
  marks: 0,
  grade: '',
  status: 'pass', // pass, fail, absent
  remarks: ''
};

// Course Type
export const Course = {
  id: '',
  courseCode: '',
  courseName: '',
  department: '',
  semester: 1,
  credits: 3,
  duration: '6 months', // Duration of the course
  description: '',
  prerequisites: [],
  instructor: '',
  maxStudents: 60,
  enrolledStudents: 0,
  status: 'active', // active, inactive, completed
  startDate: new Date(),
  endDate: new Date(),
  syllabus: '',
  createdAt: new Date()
};

// Course Registration Type
export const CourseRegistration = {
  id: '',
  studentId: '',
  courseId: '',
  registrationDate: new Date(),
  status: 'registered', // registered, dropped, completed, failed
  grade: null,
  attendance: 0,
  marks: null
};

// Timetable Type
export const Timetable = {
  id: '',
  courseId: '',
  day: 'monday', // monday, tuesday, etc.
  startTime: '09:00',
  endTime: '10:00',
  room: '',
  instructor: '',
  type: 'lecture', // lecture, lab, tutorial
  semester: 1,
  department: ''
};

// Payment Type
export const Payment = {
  id: '',
  studentId: '',
  feeId: '',
  amount: 0,
  paymentDate: new Date(),
  paymentMethod: 'cash', // cash, card, online, bank_transfer
  transactionId: '',
  receiptNumber: '',
  status: 'completed', // pending, completed, failed, refunded
  remarks: '',
  processedBy: ''
};

// Fee Structure Type
export const FeeStructure = {
  id: '',
  course: '',
  semester: 1,
  tuitionFee: 0,
  hostelFee: 0,
  examFee: 0,
  labFee: 0,
  libraryFee: 0,
  otherFees: 0,
  totalFee: 0,
  dueDate: new Date(),
  academicYear: '2024-25',
  isActive: true
};

// Notification Type
export const Notification = {
  id: '',
  userId: '',
  title: '',
  message: '',
  type: 'info', // info, success, warning, error
  isRead: false,
  createdAt: new Date(),
  link: null
};

// Dashboard Stats Type
export const DashboardStats = {
  totalStudents: 0,
  totalCourses: 0,
  totalFees: 0,
  feesCollected: 0,
  pendingFees: 0,
  hostelOccupancy: 0,
  upcomingExams: 0,
  recentAdmissions: 0,
  activeUsers: 0
};

// Student Dashboard Stats Type
export const StudentDashboardStats = {
  enrolledCourses: 0,
  completedCourses: 0,
  totalFees: 0,
  paidFees: 0,
  pendingFees: 0,
  upcomingExams: 0,
  averageGrade: 0,
  attendance: 0
};

// Fee Master Type based on FeeMaster schema
export const FeeMaster = {
  fee_id: '',
  programme_id: '',
  component: '',
  amount: 0,
  currency: 'INR',
  effective_from: new Date(),
  effective_to: null,
  category: '',
  created_at: new Date(),
  updated_at: new Date()
};

// Transaction Type based on Transactions schema
export const Transaction = {
  txn_id: '',
  student_id: '',
  admission_id: '',
  date: new Date(),
  amount: 0,
  currency: 'INR',
  payment_mode: '',
  gateway_ref: '',
  payment_status: PAYMENT_STATUS.PENDING,
  receipt_id: '',
  created_by: '',
  created_at: new Date(),
  notes: ''
};

// Receipt Type based on Receipts schema
export const Receipt = {
  receipt_id: '',
  txn_id: '',
  issued_by: '',
  issued_on: new Date(),
  pdf_drive_file_id: '',
  email_sent: false,
  created_at: new Date()
};

// Hostel Room Type based on HostelRooms schema
export const HostelRoom = {
  room_id: '',
  hostel: '',
  block: '',
  floor: 0,
  room_no: '',
  bed_no: '',
  capacity: 1,
  current_student_id: null,
  status: HOSTEL_STATUS.AVAILABLE,
  allocated_on: null,
  released_on: null,
  amenities: '',
  rent_per_month: 0,
  created_at: new Date(),
  updated_at: new Date()
};

// Hostel Allocation Type based on HostelAllocations schema
export const HostelAllocation = {
  alloc_id: '',
  student_id: '',
  room_id: '',
  allocated_by: '',
  allocated_on: new Date(),
  released_on: null,
  reason: '',
  status: 'active',
  created_at: new Date(),
  updated_at: new Date()
};
