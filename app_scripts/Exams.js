// Exams management functions

/**
 * Get all exams with filters
 */
function getExams(filters = {}) {
  const examsSheet = getSheet('Exams');
  if (!examsSheet) {
    return { success: false, error: 'Exams sheet not found' };
  }

  const data = examsSheet.getDataRange().getValues();
  const headers = data[0];

  let exams = [];

  for (let i = 1; i < data.length; i++) {
    const exam = rowToObject(headers, data[i]);

    // Apply filters
    if (filters.course_id && exam.course_id !== filters.course_id) continue;
    if (filters.invigilator_id && exam.invigilator_id !== filters.invigilator_id) continue;

    // Date range filter
    if (filters.start_date && new Date(exam.exam_date) < new Date(filters.start_date)) continue;
    if (filters.end_date && new Date(exam.exam_date) > new Date(filters.end_date)) continue;

    exams.push(exam);
  }

  return { success: true, exams };
}

/**
 * Get exam by ID
 */
function getExam(examId) {
  const examsSheet = getSheet('Exams');
  if (!examsSheet) {
    return { success: false, error: 'Exams sheet not found' };
  }

  const result = findRowById(examsSheet, 'exam_id', examId);
  if (!result) {
    return { success: false, error: 'Exam not found' };
  }

  const headers = examsSheet.getRange(1, 1, 1, examsSheet.getLastColumn()).getValues()[0];
  const exam = rowToObject(headers, result.rowData);

  return { success: true, exam };
}

/**
 * Create new exam
 */
function createExam(examData) {
  // Validate required fields
  const required = ['exam_id', 'course_id', 'exam_date'];
  const missing = validateRequired(examData, required);
  if (missing) {
    return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  const examsSheet = getSheet('Exams');
  if (!examsSheet) {
    return { success: false, error: 'Exams sheet not found' };
  }

  // Check if exam already exists
  const existingExam = findRowById(examsSheet, 'exam_id', examData.exam_id);
  if (existingExam) {
    return { success: false, error: 'Exam with this ID already exists' };
  }

  // Create new exam
  const now = getCurrentTimestamp();
  const newExam = {
    exam_id: examData.exam_id,
    course_id: examData.course_id,
    exam_date: examData.exam_date,
    venue: examData.venue || '',
    invigilator_id: examData.invigilator_id || '',
    created_at: now,
    updated_at: now
  };

  // Add to sheet
  const headers = examsSheet.getRange(1, 1, 1, examsSheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(header => newExam[header] || '');

  examsSheet.appendRow(rowData);

  // Log audit
  logAudit('Exams', newExam.exam_id, 'create', null, newExam);

  return { success: true, exam: newExam };
}

/**
 * Update exam
 */
function updateExam(examId, updateData) {
  const examsSheet = getSheet('Exams');
  if (!examsSheet) {
    return { success: false, error: 'Exams sheet not found' };
  }

  const result = findRowById(examsSheet, 'exam_id', examId);
  if (!result) {
    return { success: false, error: 'Exam not found' };
  }

  const headers = examsSheet.getRange(1, 1, 1, examsSheet.getLastColumn()).getValues()[0];
  const currentExam = rowToObject(headers, result.rowData);

  // Update fields
  const updatedExam = {
    ...currentExam,
    ...updateData,
    updated_at: getCurrentTimestamp()
  };

  // Update row
  const rowData = headers.map(header => updatedExam[header] || '');
  examsSheet.getRange(result.rowIndex, 1, 1, headers.length).setValues([rowData]);

  // Log audit
  logAudit('Exams', examId, 'update', currentExam, updatedExam);

  return { success: true, exam: updatedExam };
}

/**
 * Delete exam
 */
function deleteExam(examId) {
  const examsSheet = getSheet('Exams');
  if (!examsSheet) {
    return { success: false, error: 'Exams sheet not found' };
  }

  const result = findRowById(examsSheet, 'exam_id', examId);
  if (!result) {
    return { success: false, error: 'Exam not found' };
  }

  // Check if exam has marks entered
  const marks = getExamMarks(examId);
  if (marks.success && marks.marks.length > 0) {
    return { success: false, error: 'Cannot delete exam with marks already entered' };
  }

  // Delete row
  examsSheet.deleteRow(result.rowIndex);

  // Log audit
  logAudit('Exams', examId, 'delete', null, { exam_id: examId });

  return { success: true };
}

/**
 * Get exam marks/results
 */
function getExamMarks(examId) {
  const marksSheet = getSheet('Marks');
  if (!marksSheet) {
    return { success: false, error: 'Marks sheet not found' };
  }

  const data = marksSheet.getDataRange().getValues();
  const headers = data[0];

  let marks = [];

  for (let i = 1; i < data.length; i++) {
    const mark = rowToObject(headers, data[i]);
    if (mark.exam_id === examId) {
      marks.push(mark);
    }
  }

  return { success: true, marks };
}

/**
 * Get student exam results
 */
function getStudentExamResults(studentId, examId = null) {
  const marksSheet = getSheet('Marks');
  if (!marksSheet) {
    return { success: false, error: 'Marks sheet not found' };
  }

  const data = marksSheet.getDataRange().getValues();
  const headers = data[0];

  let results = [];

  for (let i = 1; i < data.length; i++) {
    const result = rowToObject(headers, data[i]);
    if (result.student_id === studentId) {
      if (!examId || result.exam_id === examId) {
        results.push(result);
      }
    }
  }

  return { success: true, results };
}

/**
 * Enter/update exam marks
 */
function enterExamMarks(examId, studentId, marksData) {
  // Validate required fields
  const required = ['marks_obtained'];
  const missing = validateRequired(marksData, required);
  if (missing) {
    return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  const marksSheet = getSheet('Marks');
  if (!marksSheet) {
    return { success: false, error: 'Marks sheet not found' };
  }

  // Check if marks already exist for this exam and student
  const existingMarks = findExistingMarks(examId, studentId);
  const marksId = existingMarks ? existingMarks.marks_id : generateId('MRK');

  const now = getCurrentTimestamp();
  const marksRecord = {
    marks_id: marksId,
    exam_id: examId,
    student_id: studentId,
    marks_obtained: marksData.marks_obtained,
    grade: calculateGrade(marksData.marks_obtained),
    entered_by: marksData.entered_by || 'system',
    entered_on: now
  };

  if (existingMarks) {
    // Update existing marks
    const result = findRowById(marksSheet, 'marks_id', marksId);
    if (result) {
      const headers = marksSheet.getRange(1, 1, 1, marksSheet.getLastColumn()).getValues()[0];
      const rowData = headers.map(header => marksRecord[header] || '');
      marksSheet.getRange(result.rowIndex, 1, 1, headers.length).setValues([rowData]);

      logAudit('Marks', marksId, 'update', existingMarks, marksRecord);
    }
  } else {
    // Add new marks
    const headers = marksSheet.getRange(1, 1, 1, marksSheet.getLastColumn()).getValues()[0];
    const rowData = headers.map(header => marksRecord[header] || '');
    marksSheet.appendRow(rowData);

    logAudit('Marks', marksId, 'create', null, marksRecord);
  }

  return { success: true, marks: marksRecord };
}

/**
 * Find existing marks for exam and student
 */
function findExistingMarks(examId, studentId) {
  const marksSheet = getSheet('Marks');
  if (!marksSheet) {
    return null;
  }

  const data = marksSheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    const marks = rowToObject(headers, data[i]);
    if (marks.exam_id === examId && marks.student_id === studentId) {
      return marks;
    }
  }

  return null;
}

/**
 * Calculate grade based on marks
 */
function calculateGrade(marks) {
  const marksNum = parseFloat(marks);
  if (marksNum >= 90) return 'A+';
  if (marksNum >= 80) return 'A';
  if (marksNum >= 70) return 'B+';
  if (marksNum >= 60) return 'B';
  if (marksNum >= 50) return 'C';
  if (marksNum >= 40) return 'D';
  return 'F';
}

/**
 * Get exam statistics
 */
function getExamStats() {
  const exams = getExams();
  if (!exams.success) {
    return exams;
  }

  let stats = {
    totalExams: exams.exams.length,
    completedExams: 0,
    upcomingExams: 0,
    totalMarksEntered: 0,
    averageMarks: 0,
    passRate: 0
  };

  const now = new Date();
  let totalMarks = 0;
  let passedCount = 0;
  let totalStudents = 0;

  exams.exams.forEach(exam => {
    const examDate = new Date(exam.exam_date);
    if (examDate < now) {
      stats.completedExams++;
    } else {
      stats.upcomingExams++;
    }

    // Get marks for this exam
    const marks = getExamMarks(exam.exam_id);
    if (marks.success) {
      marks.marks.forEach(mark => {
        stats.totalMarksEntered++;
        totalStudents++;
        const marksNum = parseFloat(mark.marks_obtained);
        totalMarks += marksNum;
        if (marksNum >= 40) { // Assuming 40 is pass mark
          passedCount++;
        }
      });
    }
  });

  if (stats.totalMarksEntered > 0) {
    stats.averageMarks = (totalMarks / stats.totalMarksEntered).toFixed(1);
  }

  if (totalStudents > 0) {
    stats.passRate = ((passedCount / totalStudents) * 100).toFixed(1);
  }

  return { success: true, stats };
}
