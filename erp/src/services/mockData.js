// Mock data service for development
export const mockStudents = [
  {
    id: '1',
    registrationNumber: 'CS2024001',
    name: 'John Doe',
    email: 'john.doe@college.edu',
    phone: '+1-555-0123',
    course: 'Computer Science',
    department: 'Computer Science',
    semester: 3,
    admissionDate: '2024-01-15',
    hostelAllocated: true,
    roomNumber: 'A-101',
    feesPaid: 25000,
    totalFees: 50000,
    status: 'active',
    documents: ['transcript.pdf', 'id_proof.pdf']
  },
  {
    id: '2',
    registrationNumber: 'ME2024002',
    name: 'Jane Smith',
    email: 'jane.smith@college.edu',
    phone: '+1-555-0124',
    course: 'Mechanical Engineering',
    department: 'Engineering',
    semester: 2,
    admissionDate: '2024-02-01',
    hostelAllocated: false,
    feesPaid: 30000,
    totalFees: 55000,
    status: 'active',
    documents: ['marksheet.pdf', 'certificate.pdf']
  },
  {
    id: '3',
    registrationNumber: 'EE2024003',
    name: 'Mike Johnson',
    email: 'mike.johnson@college.edu',
    phone: '+1-555-0125',
    course: 'Electrical Engineering',
    department: 'Engineering',
    semester: 4,
    admissionDate: '2023-08-15',
    hostelAllocated: true,
    roomNumber: 'B-205',
    feesPaid: 45000,
    totalFees: 50000,
    status: 'active',
    documents: ['diploma.pdf', 'photo.jpg']
  }
];

export const mockFees = [
  {
    id: '1',
    studentId: '1',
    amount: 15000,
    type: 'tuition',
    dueDate: '2024-01-31',
    paidDate: '2024-01-25',
    status: 'paid',
    paymentMethod: 'online',
    receiptNumber: 'RCP001'
  },
  {
    id: '2',
    studentId: '1',
    amount: 10000,
    type: 'hostel',
    dueDate: '2024-02-15',
    paidDate: null,
    status: 'pending',
    paymentMethod: null,
    receiptNumber: null
  },
  {
    id: '3',
    studentId: '2',
    amount: 30000,
    type: 'tuition',
    dueDate: '2024-01-31',
    paidDate: '2024-01-30',
    status: 'paid',
    paymentMethod: 'cash',
    receiptNumber: 'RCP002'
  }
];

export const mockHostelRooms = [
  {
    id: '1',
    roomNumber: 'A-101',
    block: 'A',
    floor: 1,
    capacity: 2,
    occupied: 2,
    status: 'occupied',
    amenities: ['WiFi', 'AC', 'Attached Bathroom'],
    monthlyRent: 5000
  },
  {
    id: '2',
    roomNumber: 'A-102',
    block: 'A',
    floor: 1,
    capacity: 2,
    occupied: 1,
    status: 'available',
    amenities: ['WiFi', 'AC', 'Attached Bathroom'],
    monthlyRent: 5000
  },
  {
    id: '3',
    roomNumber: 'B-201',
    block: 'B',
    floor: 2,
    capacity: 3,
    occupied: 3,
    status: 'occupied',
    amenities: ['WiFi', 'Fan', 'Shared Bathroom'],
    monthlyRent: 3500
  },
  {
    id: '4',
    roomNumber: 'B-202',
    block: 'B',
    floor: 2,
    capacity: 3,
    occupied: 0,
    status: 'available',
    amenities: ['WiFi', 'Fan', 'Shared Bathroom'],
    monthlyRent: 3500
  }
];

export const mockExams = [
  {
    id: '1',
    subject: 'Data Structures',
    course: 'Computer Science',
    semester: 3,
    examDate: '2024-12-15',
    room: 'CS-101',
    status: 'scheduled',
    maxMarks: 100,
    passingMarks: 40
  },
  {
    id: '2',
    subject: 'Thermodynamics',
    course: 'Mechanical Engineering',
    semester: 4,
    examDate: '2024-12-18',
    room: 'ME-201',
    status: 'scheduled',
    maxMarks: 100,
    passingMarks: 40
  }
];

export const mockExamResults = [
  {
    id: '1',
    examId: '1',
    studentId: '1',
    marks: 85,
    grade: 'A',
    status: 'pass',
    remarks: 'Excellent performance'
  },
  {
    id: '2',
    examId: '1',
    studentId: '2',
    marks: 65,
    grade: 'B',
    status: 'pass',
    remarks: 'Good performance'
  },
  {
    id: '3',
    examId: '2',
    studentId: '3',
    marks: 78,
    grade: 'B+',
    status: 'pass',
    remarks: 'Well done'
  }
];

// Dashboard stats
export const getDashboardStats = () => {
  const totalStudents = mockStudents.length;
  const totalFeesCollected = mockFees
    .filter(fee => fee.status === 'paid')
    .reduce((sum, fee) => sum + fee.amount, 0);
  const hostelOccupancy = Math.round(
    (mockHostelRooms.reduce((sum, room) => sum + room.occupied, 0) /
     mockHostelRooms.reduce((sum, room) => sum + room.capacity, 0)) * 100
  );
  const pendingExams = mockExams.filter(exam => exam.status === 'scheduled').length;

  return {
    totalStudents,
    totalFeesCollected,
    hostelOccupancy,
    pendingExams
  };
};

// API simulation functions
export const mockApi = {
  // Students
  getStudents: () => Promise.resolve(mockStudents),
  getStudentById: (id) => Promise.resolve(mockStudents.find(s => s.id === id)),
  getStudentByRegistration: (regNum) => Promise.resolve(mockStudents.find(s => s.registrationNumber === regNum)),

  // Fees
  getFees: (studentId) => Promise.resolve(
    studentId ? mockFees.filter(f => f.studentId === studentId) : mockFees
  ),
  getPendingFees: (studentId) => Promise.resolve(
    mockFees.filter(f => f.studentId === studentId && f.status === 'pending')
  ),

  // Hostel
  getHostelRooms: () => Promise.resolve(mockHostelRooms),
  getAvailableRooms: () => Promise.resolve(mockHostelRooms.filter(r => r.status === 'available')),

  // Exams
  getExams: () => Promise.resolve(mockExams),
  getExamResults: (studentId) => Promise.resolve(
    mockExamResults.filter(r => r.studentId === studentId)
  ),

  // Dashboard
  getDashboardStats: () => Promise.resolve(getDashboardStats())
};
