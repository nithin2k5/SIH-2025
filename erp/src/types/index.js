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
export const HostelRoom = {
  id: '',
  roomNumber: '',
  block: '',
  floor: 0,
  capacity: 2,
  occupied: 0,
  status: HOSTEL_STATUS.AVAILABLE,
  amenities: [],
  monthlyRent: 0
};

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
