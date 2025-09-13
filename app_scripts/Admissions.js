// Admissions functions

/**
 * Create new admission application
 */
function createAdmission(admissionData) {
  // Validate required fields
  const required = ['first_name', 'last_name', 'email', 'phone', 'programme_applied'];
  const missing = validateRequired(admissionData, required);
  if (missing) {
    return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  const admissionsSheet = getSheet('Admissions');
  if (!admissionsSheet) {
    return { success: false, error: 'Admissions sheet not found' };
  }

  // Check if email already exists
  const existingAdmission = findRowById(admissionsSheet, 'email', admissionData.email);
  if (existingAdmission) {
    return { success: false, error: 'An admission application with this email already exists' };
  }

  // Create new admission
  const admissionId = generateId('ADM');
  const applicationRef = generateId('APP');
  const now = getCurrentTimestamp();

  const newAdmission = {
    admission_id: admissionId,
    application_ref: applicationRef,
    applicant_name: `${admissionData.first_name} ${admissionData.last_name}`,
    first_name: admissionData.first_name,
    last_name: admissionData.last_name,
    email: admissionData.email,
    phone: admissionData.phone,
    programme_applied: admissionData.programme_applied,
    documents: admissionData.documents || '',
    applied_on: now,
    status: 'pending',
    assigned_officer_id: admissionData.assigned_officer_id || '',
    verifier_notes: '',
    admitted_on: '',
    student_id: '',
    created_at: now,
    updated_at: now
  };

  // Add to sheet
  const headers = admissionsSheet.getRange(1, 1, 1, admissionsSheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(header => newAdmission[header] || '');

  admissionsSheet.appendRow(rowData);

  // Log audit
  logAudit('Admissions', admissionId, 'create', null, newAdmission);

  return {
    success: true,
    admission: newAdmission
  };
}

/**
 * Get admission by ID
 */
function getAdmission(admissionId) {
  const admissionsSheet = getSheet('Admissions');
  if (!admissionsSheet) {
    return { success: false, error: 'Admissions sheet not found' };
  }

  const result = findRowById(admissionsSheet, 'admission_id', admissionId);
  if (!result) {
    return { success: false, error: 'Admission not found' };
  }

  const headers = admissionsSheet.getRange(1, 1, 1, admissionsSheet.getLastColumn()).getValues()[0];
  const admission = rowToObject(headers, result.rowData);

  return { success: true, admission };
}

/**
 * Get admissions by email
 */
function getAdmissionsByEmail(email) {
  const admissionsSheet = getSheet('Admissions');
  if (!admissionsSheet) {
    return { success: false, error: 'Admissions sheet not found' };
  }

  const data = admissionsSheet.getDataRange().getValues();
  const headers = data[0];

  const admissions = [];

  for (let i = 1; i < data.length; i++) {
    const admission = rowToObject(headers, data[i]);
    if (admission.email === email) {
      admissions.push(admission);
    }
  }

  return { success: true, admissions };
}

/**
 * Get all admissions with filters
 */
function getAllAdmissions(filters = {}) {
  const admissionsSheet = getSheet('Admissions');
  if (!admissionsSheet) {
    return { success: false, error: 'Admissions sheet not found' };
  }

  const data = admissionsSheet.getDataRange().getValues();
  const headers = data[0];

  let admissions = [];

  for (let i = 1; i < data.length; i++) {
    const admission = rowToObject(headers, data[i]);

    // Apply filters
    if (filters.status && admission.status !== filters.status) continue;
    if (filters.programme && admission.programme_applied !== filters.programme) continue;
    if (filters.email && admission.email !== filters.email) continue;

    admissions.push(admission);
  }

  return { success: true, admissions };
}

/**
 * Update admission status
 */
function updateAdmissionStatus(admissionId, status, verifierNotes = '', assignedOfficerId = '') {
  const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'admitted'];
  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Invalid status' };
  }

  const admissionsSheet = getSheet('Admissions');
  if (!admissionsSheet) {
    return { success: false, error: 'Admissions sheet not found' };
  }

  const result = findRowById(admissionsSheet, 'admission_id', admissionId);
  if (!result) {
    return { success: false, error: 'Admission not found' };
  }

  const headers = admissionsSheet.getRange(1, 1, 1, admissionsSheet.getLastColumn()).getValues()[0];
  const currentAdmission = rowToObject(headers, result.rowData);

  // Update fields
  const updates = {
    status,
    verifier_notes: verifierNotes,
    updated_at: getCurrentTimestamp()
  };

  if (assignedOfficerId) {
    updates.assigned_officer_id = assignedOfficerId;
  }

  if (status === 'admitted') {
    updates.admitted_on = getCurrentTimestamp();
  }

  // Apply updates
  Object.keys(updates).forEach(key => {
    const columnIndex = headers.indexOf(key) + 1;
    if (columnIndex > 0) {
      admissionsSheet.getRange(result.rowIndex, columnIndex).setValue(updates[key]);
    }
  });

  // Log audit
  logAudit('Admissions', admissionId, 'update_status', currentAdmission, { ...currentAdmission, ...updates });

  return { success: true, admission: { ...currentAdmission, ...updates } };
}

/**
 * Update admission details
 */
function updateAdmission(admissionId, updateData) {
  const admissionsSheet = getSheet('Admissions');
  if (!admissionsSheet) {
    return { success: false, error: 'Admissions sheet not found' };
  }

  const result = findRowById(admissionsSheet, 'admission_id', admissionId);
  if (!result) {
    return { success: false, error: 'Admission not found' };
  }

  const headers = admissionsSheet.getRange(1, 1, 1, admissionsSheet.getLastColumn()).getValues()[0];
  const currentAdmission = rowToObject(headers, result.rowData);

  // Update fields
  const updatedAdmission = {
    ...currentAdmission,
    ...updateData,
    updated_at: getCurrentTimestamp()
  };

  // Update row
  const rowData = headers.map(header => updatedAdmission[header] || '');
  admissionsSheet.getRange(result.rowIndex, 1, 1, headers.length).setValues([rowData]);

  // Log audit
  logAudit('Admissions', admissionId, 'update', currentAdmission, updatedAdmission);

  return { success: true, admission: updatedAdmission };
}

/**
 * Delete admission
 */
function deleteAdmission(admissionId) {
  const admissionsSheet = getSheet('Admissions');
  if (!admissionsSheet) {
    return { success: false, error: 'Admissions sheet not found' };
  }

  const result = findRowById(admissionsSheet, 'admission_id', admissionId);
  if (!result) {
    return { success: false, error: 'Admission not found' };
  }

  // Delete row
  admissionsSheet.deleteRow(result.rowIndex);

  // Log audit
  logAudit('Admissions', admissionId, 'delete', null, { admission_id: admissionId });

  return { success: true };
}

/**
 * Convert admission to student (after approval)
 */
function admitStudent(admissionId, studentData) {
  const admissionsSheet = getSheet('Admissions');
  const studentsSheet = getSheet('Students');

  if (!admissionsSheet || !studentsSheet) {
    return { success: false, error: 'Required sheets not found' };
  }

  const admissionResult = findRowById(admissionsSheet, 'admission_id', admissionId);
  if (!admissionResult) {
    return { success: false, error: 'Admission not found' };
  }

  const headers = admissionsSheet.getRange(1, 1, 1, admissionsSheet.getLastColumn()).getValues()[0];
  const admission = rowToObject(headers, admissionResult.rowData);

  if (admission.status !== 'approved') {
    return { success: false, error: 'Admission must be approved first' };
  }

  // Create student record
  const studentId = generateId('STD');
  const now = getCurrentTimestamp();

  const newStudent = {
    student_id: studentId,
    admission_id: admission.admission_id,
    first_name: admission.first_name,
    last_name: admission.last_name,
    father_name: studentData.father_name || '',
    mother_name: studentData.mother_name || '',
    dob: studentData.dob || '',
    gender: studentData.gender || '',
    email: admission.email,
    phone: admission.phone,
    address: studentData.address || '',
    programme_id: studentData.programme_id || '',
    programme_name: admission.programme_applied,
    admission_date: now,
    enrollment_status: 'active',
    year_of_study: 1,
    photo_drive_file_id: studentData.photo_drive_file_id || '',
    hostel_alloc_id: '',
    library_card_id: '',
    created_at: now,
    updated_at: now
  };

  // Add student to Students sheet
  const studentHeaders = studentsSheet.getRange(1, 1, 1, studentsSheet.getLastColumn()).getValues()[0];
  const studentRowData = studentHeaders.map(header => newStudent[header] || '');
  studentsSheet.appendRow(studentRowData);

  // Update admission with student_id and status
  admissionsSheet.getRange(admissionResult.rowIndex, headers.indexOf('student_id') + 1).setValue(studentId);
  admissionsSheet.getRange(admissionResult.rowIndex, headers.indexOf('status') + 1).setValue('admitted');
  admissionsSheet.getRange(admissionResult.rowIndex, headers.indexOf('admitted_on') + 1).setValue(now);
  admissionsSheet.getRange(admissionResult.rowIndex, headers.indexOf('updated_at') + 1).setValue(now);

  // Log audit
  logAudit('Students', studentId, 'create', null, newStudent);
  logAudit('Admissions', admissionId, 'convert_to_student', admission, { ...admission, student_id: studentId, status: 'admitted' });

  return {
    success: true,
    student: newStudent,
    admission: { ...admission, student_id: studentId, status: 'admitted' }
  };
}

/**
 * Get admission statistics
 */
function getAdmissionStats() {
  const admissionsSheet = getSheet('Admissions');
  if (!admissionsSheet) {
    return { success: false, error: 'Admissions sheet not found' };
  }

  const data = admissionsSheet.getDataRange().getValues();
  const headers = data[0];

  let stats = {
    total: 0,
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    admitted: 0
  };

  for (let i = 1; i < data.length; i++) {
    const admission = rowToObject(headers, data[i]);
    stats.total++;
    stats[admission.status]++;
  }

  return { success: true, stats };
}
