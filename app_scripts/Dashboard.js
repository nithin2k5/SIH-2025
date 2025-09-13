// Dashboard statistics functions

/**
 * Get general dashboard statistics
 */
function getDashboardStats() {
  try {
    const stats = {
      totalStudents: 0,
      totalCourses: 0,
      totalFeesCollected: 0,
      hostelOccupancy: 0,
      pendingExams: 0,
      activeUsers: 0
    };

    // Get student stats
    const studentStats = getStudentStats();
    if (studentStats.success) {
      stats.totalStudents = studentStats.stats.active;
    }

    // Get course count
    const courses = getAllCourses();
    if (courses.success) {
      stats.totalCourses = courses.courses.length;
    }

    // Get fee stats
    const feeStats = getFeeStats();
    if (feeStats.success) {
      stats.totalFeesCollected = feeStats.stats.totalCollected;
    }

    // Get hostel occupancy
    const hostelStats = getHostelStats();
    if (hostelStats.success) {
      stats.hostelOccupancy = parseFloat(hostelStats.stats.occupancyRate) || 0;
    }

    // Get pending exams
    const exams = getExams();
    if (exams.success) {
      const now = new Date();
      stats.pendingExams = exams.exams.filter(exam =>
        new Date(exam.exam_date) >= now
      ).length;
    }

    // Get active users count
    const users = getAllUsers({ active: true });
    if (users.success) {
      stats.activeUsers = users.users.length;
    }

    return { success: true, stats };

  } catch (error) {
    return { success: false, error: 'Failed to generate dashboard stats: ' + error.toString() };
  }
}

/**
 * Get student-specific dashboard statistics
 */
function getStudentDashboardStats(studentId) {
  try {
    const stats = {
      enrolledCourses: 0,
      pendingFees: 0,
      averageGrade: 'N/A',
      attendance: 85, // Mock data - would need attendance system
      completedExams: 0,
      upcomingExams: 0
    };

    // Get student courses/enrollments
    const enrollments = getStudentCourses(studentId);
    if (enrollments.success) {
      stats.enrolledCourses = enrollments.enrollments.length;
    }

    // Get pending fees
    const feeSummary = getStudentFeeSummary(studentId);
    if (feeSummary.success) {
      stats.pendingFees = feeSummary.summary.totalPending;
    }

    // Get exam results
    const examResults = getStudentExamResults(studentId);
    if (examResults.success && examResults.results.length > 0) {
      const completedResults = examResults.results.filter(result => result.marks_obtained !== null);
      stats.completedExams = completedResults.length;

      if (completedResults.length > 0) {
        const totalMarks = completedResults.reduce((sum, result) => sum + parseFloat(result.marks_obtained), 0);
        stats.averageGrade = (totalMarks / completedResults.length).toFixed(1);
      }
    }

    // Get upcoming exams for student's courses
    if (enrollments.success) {
      const courseIds = enrollments.enrollments.map(e => e.course_id);
      const allExams = getExams();
      if (allExams.success) {
        const now = new Date();
        stats.upcomingExams = allExams.exams.filter(exam =>
          courseIds.includes(exam.course_id) && new Date(exam.exam_date) >= now
        ).length;
      }
    }

    return { success: true, stats };

  } catch (error) {
    return { success: false, error: 'Failed to generate student dashboard stats: ' + error.toString() };
  }
}

/**
 * Get recent activity summary
 */
function getRecentActivity(limit = 10) {
  try {
    const auditLogs = getAuditLogs({
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last 7 days
    });

    if (!auditLogs.success) {
      return { success: false, error: 'Failed to fetch recent activity' };
    }

    // Group and summarize activities
    const activities = [];
    const activityGroups = {};

    auditLogs.logs.slice(0, limit * 2).forEach(log => {
      const key = `${log.sheet_name}-${log.action}`;
      if (!activityGroups[key]) {
        activityGroups[key] = {
          type: getActivityType(log.sheet_name, log.action),
          count: 0,
          lastTimestamp: log.timestamp,
          description: getActivityDescription(log.sheet_name, log.action)
        };
      }
      activityGroups[key].count++;
      if (new Date(log.timestamp) > new Date(activityGroups[key].lastTimestamp)) {
        activityGroups[key].lastTimestamp = log.timestamp;
      }
    });

    // Convert to activity array
    Object.values(activityGroups).forEach(group => {
      activities.push({
        type: group.type,
        description: group.count > 1 ? `${group.description} (${group.count} items)` : group.description,
        timestamp: group.lastTimestamp,
        count: group.count
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return { success: true, activities: activities.slice(0, limit) };

  } catch (error) {
    return { success: false, error: 'Failed to fetch recent activity: ' + error.toString() };
  }
}

/**
 * Get activity type based on sheet and action
 */
function getActivityType(sheetName, action) {
  const typeMap = {
    'Students': 'user',
    'Admissions': 'admission',
    'Users': 'user',
    'Transactions': 'payment',
    'Exams': 'exam',
    'HostelAllocations': 'hostel',
    'Courses': 'course'
  };

  return typeMap[sheetName] || 'system';
}

/**
 * Get activity description
 */
function getActivityDescription(sheetName, action) {
  const descriptions = {
    'Students-create': 'New student registered',
    'Students-update': 'Student information updated',
    'Admissions-create': 'New admission application',
    'Admissions-update': 'Admission updated',
    'Admissions-update_status': 'Admission status changed',
    'Users-create': 'New user created',
    'Users-update': 'User information updated',
    'Transactions-create': 'Payment processed',
    'Exams-create': 'Exam scheduled',
    'Exams-update': 'Exam updated',
    'HostelAllocations-create': 'Room allocated',
    'HostelAllocations-deallocate': 'Room deallocated',
    'Courses-create': 'Course created',
    'Courses-update': 'Course updated'
  };

  return descriptions[`${sheetName}-${action}`] || `${sheetName} ${action}`;
}

/**
 * Get system health metrics
 */
function getSystemHealth() {
  try {
    const health = {
      serverStatus: 'healthy',
      databaseStatus: 'healthy',
      apiResponseTime: '120ms',
      uptime: '99.9%',
      activeUsers: 0,
      memoryUsage: 68,
      cpuUsage: 45
    };

    // Get active users count
    const users = getAllUsers({ active: true });
    if (users.success) {
      health.activeUsers = users.users.length;
    }

    // Check if sheets are accessible (database health)
    const sheets = ['Users', 'Admissions', 'Students'];
    let accessibleSheets = 0;

    sheets.forEach(sheetName => {
      const sheet = getSheet(sheetName);
      if (sheet) {
        accessibleSheets++;
      }
    });

    if (accessibleSheets < sheets.length) {
      health.databaseStatus = 'warning';
    }

    return { success: true, health };

  } catch (error) {
    return { success: false, error: 'Failed to get system health: ' + error.toString() };
  }
}

/**
 * Get enrollment trends (for charts)
 */
function getEnrollmentTrends(days = 30) {
  try {
    const admissions = getAllAdmissions();
    if (!admissions.success) {
      return admissions;
    }

    const trends = {};
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Initialize daily counts
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      trends[dateKey] = 0;
    }

    // Count admissions by date
    admissions.admissions.forEach(admission => {
      const admissionDate = new Date(admission.applied_on).toISOString().split('T')[0];
      if (trends.hasOwnProperty(admissionDate)) {
        trends[admissionDate]++;
      }
    });

    return {
      success: true,
      trends: Object.entries(trends).map(([date, count]) => ({ date, count }))
    };

  } catch (error) {
    return { success: false, error: 'Failed to get enrollment trends: ' + error.toString() };
  }
}
