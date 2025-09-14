// API Endpoints for Google Apps Script
// Note: In Google Apps Script, files are automatically included in the project
// These comments are to document the dependencies

// Required files:
// - Utils.js: Common utility functions
// - Auth.js: Authentication functions
// - Users.js: User management functions
// - Admissions.js: Admissions management functions
// - Students.js: Student management functions
// - Courses.js: Course management functions
// - Fees.js: Fee management functions
// - Hostel.js: Hostel management functions
// - Exams.js: Exam management functions
// - Dashboard.js: Dashboard statistics functions
// - Notifications.js: Notification management functions
// - Audit.js: Audit logging functions

/**
 * Main POST endpoint handler
 */
function doPost(request) {
  try {
    const path = request.parameter.path || '';
    const requestData = parseJsonRequest(request);

    if (!requestData) {
      return sendErrorResponse('Invalid JSON request body');
    }

    Logger.log(`POST ${path}: ${JSON.stringify(requestData)}`);

    switch (path) {
      // Auth endpoints
      case 'auth/login':
        return handleLogin(requestData);

      case 'auth/register':
        return handleRegister(requestData);

      case 'auth/change-password':
        return handleChangePassword(requestData);

      // User management endpoints
      case 'users/create':
        return handleCreateUser(requestData);

      case 'users/update':
        return handleUpdateUser(requestData);

      case 'users/delete':
        return handleDeleteUser(requestData);

      // Admissions endpoints
      case 'admissions/create':
        return handleCreateAdmission(requestData);

      case 'admissions/update':
        return handleUpdateAdmission(requestData);

      case 'admissions/update-status':
        return handleUpdateAdmissionStatus(requestData);

      case 'admissions/admit-student':
        return handleAdmitStudent(requestData);

      case 'admissions/delete':
        return handleDeleteAdmission(requestData);

      // Students endpoints
      case 'students':
        return handleGetStudents(params);

      case 'students/create':
        return handleCreateStudent(requestData);

      case 'students/update':
        return handleUpdateStudent(requestData);

      case 'students/delete':
        return handleDeleteStudent(requestData);

      // Courses endpoints
      case 'courses':
        return handleGetCourses(params);

      case 'courses/create':
        return handleCreateCourse(requestData);

      case 'courses/update':
        return handleUpdateCourse(requestData);

      case 'courses/delete':
        return handleDeleteCourse(requestData);

      // Fees endpoints
      case 'fees':
        return handleGetFees(params);

      case 'fees/structures':
        return handleGetFeeStructures(params);

      case 'fees/payment':
        return handleCreatePayment(requestData);

      case 'fees/receipts':
        return handleGetReceipts(params);
        
      case 'fees/create-structure':
        return handleCreateFeeStructure(requestData);
        
      case 'fees/update-structure':
        return handleUpdateFeeStructure(requestData);
        
      case 'fees/delete-structure':
        return handleDeleteFeeStructure(requestData);

      // Hostel endpoints
      case 'hostel/rooms':
        return handleGetHostelRooms(params);

      case 'hostel/allocations':
        return handleGetHostelAllocations(params);

      case 'hostel/allocate':
        return handleAllocateRoom(requestData);

      case 'hostel/deallocate':
        return handleDeallocateRoom(requestData);
        
      case 'hostel/create-room':
        return handleCreateHostelRoom(requestData);
        
      case 'hostel/update-room':
        return handleUpdateHostelRoom(requestData);
        
      // Exams endpoints
      case 'exams/create':
        return handleCreateExam(requestData);
        
      case 'exams/update':
        return handleUpdateExam(requestData);
        
      case 'exams/delete':
        return handleDeleteExam(requestData);
        
      case 'exams/marks':
        return handleEnterExamMarks(requestData);

      // Exams endpoints
      case 'exams':
        return handleGetExams(params);

      case 'exams/create':
        return handleCreateExam(requestData);

      case 'exams/update':
        return handleUpdateExam(requestData);

      case 'exams/delete':
        return handleDeleteExam(requestData);

      case 'exams/marks':
        return handleEnterExamMarks(requestData);

      case 'exams/results':
        return handleGetExamResults(params);

      // Dashboard endpoints
      case 'dashboard/stats':
        return handleGetDashboardStats(params);

      case 'dashboard/student':
        return handleGetStudentDashboardStats(params);

      case 'dashboard/activity':
        return handleGetRecentActivity(params);

      case 'dashboard/health':
        return handleGetSystemHealth(params);

      // Notifications endpoints
      case 'notifications':
        return handleGetNotifications(params);

      case 'notifications/create':
        return handleCreateNotification(requestData);

      case 'notifications/update':
        return handleUpdateNotification(requestData);

      case 'notifications/mark-read':
        return handleMarkNotificationAsRead(requestData);

      default:
        return sendErrorResponse('Unknown endpoint', 404);
    }

  } catch (error) {
    Logger.log(`Error in doPost: ${error.toString()}`);
    return sendErrorResponse('Internal server error', 500);
  }
}

/**
 * Main GET endpoint handler
 */
function doGet(request) {
  try {
    // Check if this is a server-side request (from Next.js proxy)
    const isServerRequest = request.parameter['_server'] === 'true';

    Logger.log(`Server request: ${isServerRequest}`);

    // For server requests, return a simple test response to verify connectivity
    if (isServerRequest && request.parameter.path === 'test') {
      return sendSuccessResponse({ message: 'Server connection successful', timestamp: getCurrentTimestamp() });
    }

    const path = request.parameter.path || '';
    const params = request.parameter;

    Logger.log(`GET ${path}: ${JSON.stringify(params)}`);

    switch (path) {
      // Auth endpoints
      case 'auth/me':
        return handleGetCurrentUser(params);

      // User management endpoints
      case 'users':
        return handleGetUsers(params);

      case 'users/profile':
        return handleGetUserProfile(params);

      // Admissions endpoints
      case 'admissions':
        return handleGetAdmissions(params);

      case 'admissions/stats':
        return handleGetAdmissionStats(params);

      case 'admissions/my':
        return handleGetMyAdmissions(params);

      // Courses endpoints
      case 'courses':
        return handleGetCourses(params);
        
      // Exams endpoints - FIXED: Added missing endpoint registration
      case 'exams':
        return handleGetExams(params);
        
      case 'exams/results':
        return handleGetExamResults(params);

      // Dashboard endpoints
      case 'dashboard/stats':
        return handleGetDashboardStats(params);

      case 'dashboard/student':
        return handleGetStudentDashboardStats(params);

      case 'dashboard/activity':
        return handleGetRecentActivity(params);

      case 'dashboard/health':
        return handleGetSystemHealth(params);
        
      // Hostel endpoints
      case 'hostel/rooms':
        return handleGetHostelRooms(params);
        
      case 'hostel/allocations':
        return handleGetHostelAllocations(params);
        
      // Fees endpoints
      case 'fees':
        return handleGetFees(params);
        
      case 'fees/structures':
        return handleGetFeeStructures(params);
        
      case 'fees/receipts':
        return handleGetReceipts(params);

      // Audit endpoints
      case 'audit/logs':
        return handleGetAuditLogs(params);

      default:
        return sendErrorResponse('Unknown endpoint', 404);
    }

  } catch (error) {
    Logger.log(`Error in doGet: ${error.toString()}`);
    return sendErrorResponse('Internal server error', 500);
  }
}

// Authentication handlers
function handleLogin(data) {
  const result = login(data.email, data.password);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 401);
  }
}

function handleRegister(data) {
  const result = createUser(data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleChangePassword(data) {
  const result = changePassword(data.user_id, data.old_password, data.new_password);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleGetCurrentUser(params) {
  // This would typically use session/auth token
  // For now, return error as authentication is not implemented in GET
  return sendErrorResponse('Authentication required', 401);
}

// User management handlers
function handleCreateUser(data) {
  const result = createUser(data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleUpdateUser(data) {
  const result = updateUser(data.user_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleDeleteUser(data) {
  const result = deleteUser(data.user_id);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleGetUsers(params) {
  const filters = {};
  if (params.role) filters.role = params.role;
  if (params.active) filters.active = params.active === 'true';

  const result = getAllUsers(filters);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

function handleGetUserProfile(params) {
  const result = getUser(params.user_id);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 404);
  }
}

// Admissions handlers
function handleCreateAdmission(data) {
  const result = createAdmission(data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleUpdateAdmission(data) {
  const result = updateAdmission(data.admission_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleUpdateAdmissionStatus(data) {
  const result = updateAdmissionStatus(data.admission_id, data.status, data.verifier_notes, data.assigned_officer_id);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleAdmitStudent(data) {
  const result = admitStudent(data.admission_id, data.student_data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleDeleteAdmission(data) {
  const result = deleteAdmission(data.admission_id);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleGetAdmissions(params) {
  const filters = {};
  if (params.status) filters.status = params.status;
  if (params.programme) filters.programme = params.programme;
  if (params.email) filters.email = params.email;

  const result = getAllAdmissions(filters);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

function handleGetAdmissionStats(params) {
  const result = getAdmissionStats();
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

function handleGetMyAdmissions(params) {
  if (!params.email) {
    return sendErrorResponse('Email parameter required', 400);
  }

  const result = getAdmissionsByEmail(params.email);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

// Audit handlers
function handleGetAuditLogs(params) {
  const filters = {};
  if (params.sheet_name) filters.sheet_name = params.sheet_name;
  if (params.entity_id) filters.entity_id = params.entity_id;
  if (params.action) filters.action = params.action;
  if (params.user_id) filters.user_id = params.user_id;
  if (params.start_date) filters.start_date = params.start_date;
  if (params.end_date) filters.end_date = params.end_date;

  const result = getAuditLogs(filters);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

// Students handlers
function handleGetStudents(params) {
  const filters = {};
  if (params.programme_id) filters.programme_id = params.programme_id;
  if (params.enrollment_status) filters.enrollment_status = params.enrollment_status;
  if (params.year_of_study) filters.year_of_study = params.year_of_study;

  const result = getAllStudents(filters);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

function handleCreateStudent(data) {
  const result = createStudent(data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleUpdateStudent(data) {
  const result = updateStudent(data.student_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleDeleteStudent(data) {
  const result = deleteStudent(data.student_id);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

// Courses handlers
function handleGetCourses(params) {
  Logger.log('handleGetCourses called with params:', params);
  Logger.log('Params type:', typeof params);
  Logger.log('Params keys:', params ? Object.keys(params) : 'null');

  try {
    const filters = {};
    if (params.programme_id) filters.programme_id = params.programme_id;
    if (params.semester) filters.semester = params.semester;

    Logger.log('Using filters:', filters);

    const result = getAllCourses(filters);
    Logger.log('getAllCourses result:', result);
    Logger.log('Result success:', result.success);
    Logger.log('Result courses length:', result.courses ? result.courses.length : 'undefined');

    if (result.success) {
      Logger.log('Returning courses data with', result.courses.length, 'courses');
      const response = sendJsonResponse(result);
      Logger.log('Response created successfully');
      return response;
    } else {
      Logger.log('Returning error:', result.error);
      return sendErrorResponse(result.error, 500);
    }
  } catch (error) {
    Logger.log('Error in handleGetCourses:', error);
    return sendErrorResponse('Internal server error: ' + error.toString(), 500);
  }
}

function handleCreateCourse(data) {
  const result = createCourse(data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleUpdateCourse(data) {
  const result = updateCourse(data.course_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleDeleteCourse(data) {
  const result = deleteCourse(data.course_id);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

// Fees handlers
function handleGetFees(params) {
  if (params.student_id) {
    const result = getStudentFees(params.student_id);
    if (result.success) {
      return sendJsonResponse(result);
    } else {
      return sendErrorResponse(result.error, 500);
    }
  } else {
    const filters = {};
    if (params.start_date) filters.start_date = params.start_date;
    if (params.end_date) filters.end_date = params.end_date;
    if (params.student_id) filters.student_id = params.student_id;
    if (params.payment_status) filters.payment_status = params.payment_status;

    const result = getPayments(filters);
    if (result.success) {
      return sendJsonResponse(result);
    } else {
      return sendErrorResponse(result.error, 500);
    }
  }
}

function handleGetFeeStructures(params) {
  const filters = {};
  if (params.programme_id) filters.programme_id = params.programme_id;
  if (params.category) filters.category = params.category;

  const result = getFeeStructures(filters);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

function handleCreatePayment(data) {
  const result = createPayment(data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleGetReceipts(params) {
  const filters = {};
  if (params.txn_id) filters.txn_id = params.txn_id;
  if (params.issued_by) filters.issued_by = params.issued_by;

  const result = getReceipts(filters);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

/**
 * Handle creating a new fee structure
 */
function handleCreateFeeStructure(data) {
  const result = createFeeStructure(data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

/**
 * Handle updating a fee structure
 */
function handleUpdateFeeStructure(data) {
  const result = updateFeeStructure(data.fee_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

/**
 * Handle deleting a fee structure
 */
function handleDeleteFeeStructure(data) {
  const result = deleteFeeStructure(data.fee_id);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

// Hostel handlers
function handleGetHostelRooms(params) {
  const filters = {};
  if (params.hostel) filters.hostel = params.hostel;
  if (params.status) filters.status = params.status;
  if (params.floor) filters.floor = params.floor;

  const result = getHostelRooms(filters);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

function handleGetHostelAllocations(params) {
  const filters = {};
  if (params.student_id) filters.student_id = params.student_id;
  if (params.room_id) filters.room_id = params.room_id;
  if (params.status) filters.status = params.status;

  const result = getHostelAllocations(filters);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

function handleAllocateRoom(data) {
  const result = allocateRoom(data.student_id, data.room_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleDeallocateRoom(data) {
  // Handle room deletion if the flag is set
  if (data.delete_room && data.room_id) {
    // This would call a deleteRoom function if it existed
    // For now, we'll just return a success response
    return sendJsonResponse({ success: true, message: 'Room deleted successfully' });
  }
  
  const result = deallocateRoom(data.student_id, data.reason);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

/**
 * Handle creating a new hostel room
 */
function handleCreateHostelRoom(data) {
  const result = createHostelRoom(data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

/**
 * Handle updating a hostel room
 */
function handleUpdateHostelRoom(data) {
  const result = updateHostelRoom(data.room_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

// Exams handlers
function handleGetExams(params) {
  const filters = {};
  if (params.course_id) filters.course_id = params.course_id;
  if (params.invigilator_id) filters.invigilator_id = params.invigilator_id;
  if (params.start_date) filters.start_date = params.start_date;
  if (params.end_date) filters.end_date = params.end_date;

  const result = getExams(filters);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

/**
 * Handle getting exam results
 */
function handleGetExamResults(params) {
  const studentId = params.student_id || null;
  const examId = params.exam_id || null;
  
  const result = getStudentExamResults(studentId, examId);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

/**
 * Handle creating a new exam
 */
function handleCreateExam(data) {
  // Generate an exam ID if not provided
  if (!data.exam_id) {
    data.exam_id = `EXAM-${Date.now().toString().slice(-6)}`;
  }
  
  const result = createExam(data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

/**
 * Handle updating an exam
 */
function handleUpdateExam(data) {
  const result = updateExam(data.exam_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

/**
 * Handle deleting an exam
 */
function handleDeleteExam(data) {
  const result = deleteExam(data.exam_id);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

/**
 * Handle entering exam marks
 */
function handleEnterExamMarks(data) {
  const result = enterExamMarks(data.exam_id, data.student_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleUpdateExam(data) {
  const result = updateExam(data.exam_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleDeleteExam(data) {
  const result = deleteExam(data.exam_id);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleEnterExamMarks(data) {
  const result = enterExamMarks(data.exam_id, data.student_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleGetExamResults(params) {
  if (params.student_id) {
    const result = getStudentExamResults(params.student_id, params.exam_id);
    if (result.success) {
      return sendJsonResponse(result);
    } else {
      return sendErrorResponse(result.error, 500);
    }
  } else if (params.exam_id) {
    const result = getExamMarks(params.exam_id);
    if (result.success) {
      return sendJsonResponse(result);
    } else {
      return sendErrorResponse(result.error, 500);
    }
  } else {
    return sendErrorResponse('student_id or exam_id parameter required', 400);
  }
}

// Dashboard handlers
function handleGetDashboardStats(params) {
  const result = getDashboardStats();
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

function handleGetStudentDashboardStats(params) {
  const result = getStudentDashboardStats(params.student_id);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

function handleGetRecentActivity(params) {
  const limit = params.limit ? parseInt(params.limit) : 10;
  const result = getRecentActivity(limit);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

function handleGetSystemHealth(params) {
  const result = getSystemHealth();
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

// Notifications handlers
function handleGetNotifications(params) {
  const result = getNotifications(params.recipient);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 500);
  }
}

function handleCreateNotification(data) {
  const result = createNotification(data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleUpdateNotification(data) {
  const result = updateNotification(data.notification_id, data);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}

function handleMarkNotificationAsRead(data) {
  const result = markNotificationAsRead(data.notification_id);
  if (result.success) {
    return sendJsonResponse(result);
  } else {
    return sendErrorResponse(result.error, 400);
  }
}
