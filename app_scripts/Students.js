// Students management functions

/**
 * Get student by ID
 */
function getStudent(studentId) {
  const studentsSheet = getSheet('Students');
  if (!studentsSheet) {
    return { success: false, error: 'Students sheet not found' };
  }

  const result = findRowById(studentsSheet, 'student_id', studentId);
  if (!result) {
    return { success: false, error: 'Student not found' };
  }

  const headers = studentsSheet.getRange(1, 1, 1, studentsSheet.getLastColumn()).getValues()[0];
  const student = rowToObject(headers, result.rowData);

  return { success: true, student };
}

/**
 * Get all students with filters
 */
function getAllStudents(filters = {}) {
  const studentsSheet = getSheet('Students');
  if (!studentsSheet) {
    return { success: false, error: 'Students sheet not found' };
  }

  const data = studentsSheet.getDataRange().getValues();
  const headers = data[0];

  let students = [];

  for (let i = 1; i < data.length; i++) {
    const student = rowToObject(headers, data[i]);

    // Apply filters
    if (filters.programme_id && student.programme_id !== filters.programme_id) continue;
    if (filters.enrollment_status && student.enrollment_status !== filters.enrollment_status) continue;
    if (filters.year_of_study && student.year_of_study != filters.year_of_study) continue;

    students.push(student);
  }

  return { success: true, students };
}

/**
 * Create new student
 */
function createStudent(studentData) {
  // Validate required fields
  const required = ['student_id', 'first_name', 'last_name', 'email'];
  const missing = validateRequired(studentData, required);
  if (missing) {
    return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  const studentsSheet = getSheet('Students');
  if (!studentsSheet) {
    return { success: false, error: 'Students sheet not found' };
  }

  // Check if student already exists
  const existingStudent = findRowById(studentsSheet, 'student_id', studentData.student_id);
  if (existingStudent) {
    return { success: false, error: 'Student with this ID already exists' };
  }

  // Create new student
  const now = getCurrentTimestamp();
  const newStudent = {
    student_id: studentData.student_id,
    admission_id: studentData.admission_id || '',
    first_name: studentData.first_name,
    last_name: studentData.last_name,
    father_name: studentData.father_name || '',
    mother_name: studentData.mother_name || '',
    dob: studentData.dob || '',
    gender: studentData.gender || '',
    email: studentData.email,
    phone: studentData.phone || '',
    address: studentData.address || '',
    programme_id: studentData.programme_id || '',
    programme_name: studentData.programme_name || '',
    admission_date: studentData.admission_date || now,
    enrollment_status: studentData.enrollment_status || 'active',
    year_of_study: studentData.year_of_study || 1,
    photo_drive_file_id: studentData.photo_drive_file_id || '',
    hostel_alloc_id: studentData.hostel_alloc_id || '',
    library_card_id: studentData.library_card_id || '',
    created_at: now,
    updated_at: now
  };

  // Add to sheet
  const headers = studentsSheet.getRange(1, 1, 1, studentsSheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(header => newStudent[header] || '');

  studentsSheet.appendRow(rowData);

  // Log audit
  logAudit('Students', newStudent.student_id, 'create', null, newStudent);

  return { success: true, student: newStudent };
}

/**
 * Update student
 */
function updateStudent(studentId, updateData) {
  const studentsSheet = getSheet('Students');
  if (!studentsSheet) {
    return { success: false, error: 'Students sheet not found' };
  }

  const result = findRowById(studentsSheet, 'student_id', studentId);
  if (!result) {
    return { success: false, error: 'Student not found' };
  }

  const headers = studentsSheet.getRange(1, 1, 1, studentsSheet.getLastColumn()).getValues()[0];
  const currentStudent = rowToObject(headers, result.rowData);

  // Update fields
  const updatedStudent = {
    ...currentStudent,
    ...updateData,
    updated_at: getCurrentTimestamp()
  };

  // Update row
  const rowData = headers.map(header => updatedStudent[header] || '');
  studentsSheet.getRange(result.rowIndex, 1, 1, headers.length).setValues([rowData]);

  // Log audit
  logAudit('Students', studentId, 'update', currentStudent, updatedStudent);

  return { success: true, student: updatedStudent };
}

/**
 * Delete student (soft delete by changing status)
 */
function deleteStudent(studentId) {
  const studentsSheet = getSheet('Students');
  if (!studentsSheet) {
    return { success: false, error: 'Students sheet not found' };
  }

  const result = findRowById(studentsSheet, 'student_id', studentId);
  if (!result) {
    return { success: false, error: 'Student not found' };
  }

  const headers = studentsSheet.getRange(1, 1, 1, studentsSheet.getLastColumn()).getValues()[0];

  // Update status to inactive
  studentsSheet.getRange(result.rowIndex, headers.indexOf('enrollment_status') + 1).setValue('inactive');
  studentsSheet.getRange(result.rowIndex, headers.indexOf('updated_at') + 1).setValue(getCurrentTimestamp());

  // Log audit
  logAudit('Students', studentId, 'delete', null, { student_id: studentId });

  return { success: true };
}

/**
 * Get student courses/enrollments
 */
function getStudentCourses(studentId) {
  const enrollmentsSheet = getSheet('Enrollments');
  if (!enrollmentsSheet) {
    return { success: false, error: 'Enrollments sheet not found' };
  }

  const data = enrollmentsSheet.getDataRange().getValues();
  const headers = data[0];

  let enrollments = [];

  for (let i = 1; i < data.length; i++) {
    const enrollment = rowToObject(headers, data[i]);
    if (enrollment.student_id === studentId) {
      enrollments.push(enrollment);
    }
  }

  return { success: true, enrollments };
}

/**
 * Get student stats
 */
function getStudentStats() {
  const studentsSheet = getSheet('Students');
  if (!studentsSheet) {
    return { success: false, error: 'Students sheet not found' };
  }

  const data = studentsSheet.getDataRange().getValues();
  const headers = data[0];

  let stats = {
    total: 0,
    active: 0,
    inactive: 0,
    byProgramme: {},
    byYear: {}
  };

  for (let i = 1; i < data.length; i++) {
    const student = rowToObject(headers, data[i]);
    stats.total++;

    if (student.enrollment_status === 'active') {
      stats.active++;
    } else {
      stats.inactive++;
    }

    // Count by programme
    const programme = student.programme_name || 'Unknown';
    stats.byProgramme[programme] = (stats.byProgramme[programme] || 0) + 1;

    // Count by year
    const year = student.year_of_study || 'Unknown';
    stats.byYear[year] = (stats.byYear[year] || 0) + 1;
  }

  return { success: true, stats };
}
