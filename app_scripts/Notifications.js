// Notifications management functions

/**
 * Get notifications for a user
 */
function getNotifications(recipientId) {
  const notificationsSheet = getSheet('Notifications');
  if (!notificationsSheet) {
    return { success: false, error: 'Notifications sheet not found' };
  }

  const data = notificationsSheet.getDataRange().getValues();
  const headers = data[0];

  let notifications = [];

  for (let i = 1; i < data.length; i++) {
    const notification = rowToObject(headers, data[i]);
    if (notification.recipient === recipientId) {
      notifications.push(notification);
    }
  }

  // Sort by creation date (newest first)
  notifications.sort((a, b) => new Date(b.sent_on) - new Date(a.sent_on));

  return { success: true, notifications };
}

/**
 * Create new notification
 */
function createNotification(notificationData) {
  // Validate required fields
  const required = ['recipient', 'type', 'subject', 'body'];
  const missing = validateRequired(notificationData, required);
  if (missing) {
    return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  const notificationsSheet = getSheet('Notifications');
  if (!notificationsSheet) {
    return { success: false, error: 'Notifications sheet not found' };
  }

  // Generate notification ID
  const notificationId = generateId('NOTIF');
  const now = getCurrentTimestamp();

  const newNotification = {
    notification_id: notificationId,
    recipient: notificationData.recipient,
    type: notificationData.type,
    subject: notificationData.subject,
    body: notificationData.body,
    sent_on: now,
    status: 'sent',
    response: ''
  };

  // Add to sheet
  const headers = notificationsSheet.getRange(1, 1, 1, notificationsSheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(header => newNotification[header] || '');

  notificationsSheet.appendRow(rowData);

  // Log audit
  logAudit('Notifications', notificationId, 'create', null, newNotification);

  return { success: true, notification: newNotification };
}

/**
 * Update notification status/response
 */
function updateNotification(notificationId, updateData) {
  const notificationsSheet = getSheet('Notifications');
  if (!notificationsSheet) {
    return { success: false, error: 'Notifications sheet not found' };
  }

  const result = findRowById(notificationsSheet, 'notification_id', notificationId);
  if (!result) {
    return { success: false, error: 'Notification not found' };
  }

  const headers = notificationsSheet.getRange(1, 1, 1, notificationsSheet.getLastColumn()).getValues()[0];
  const currentNotification = rowToObject(headers, result.rowData);

  // Update fields
  const updatedNotification = {
    ...currentNotification,
    ...updateData
  };

  // Update row
  const rowData = headers.map(header => updatedNotification[header] || '');
  notificationsSheet.getRange(result.rowIndex, 1, 1, headers.length).setValues([rowData]);

  // Log audit
  logAudit('Notifications', notificationId, 'update', currentNotification, updatedNotification);

  return { success: true, notification: updatedNotification };
}

/**
 * Mark notification as read
 */
function markNotificationAsRead(notificationId) {
  return updateNotification(notificationId, { status: 'read' });
}

/**
 * Create bulk notifications
 */
function createBulkNotifications(notificationsData) {
  if (!Array.isArray(notificationsData)) {
    return { success: false, error: 'Notifications data must be an array' };
  }

  const results = [];
  const errors = [];

  notificationsData.forEach(notificationData => {
    const result = createNotification(notificationData);
    if (result.success) {
      results.push(result.notification);
    } else {
      errors.push({
        data: notificationData,
        error: result.error
      });
    }
  });

  return {
    success: true,
    created: results.length,
    errors: errors.length,
    notifications: results,
    failedNotifications: errors
  };
}

/**
 * Send notification to all students
 */
function notifyAllStudents(subject, body, type = 'announcement') {
  const students = getAllStudents();
  if (!students.success) {
    return students;
  }

  const notificationsData = students.students.map(student => ({
    recipient: student.student_id,
    type: type,
    subject: subject,
    body: body
  }));

  return createBulkNotifications(notificationsData);
}

/**
 * Send notification to students by criteria
 */
function notifyStudentsByCriteria(criteria, subject, body, type = 'announcement') {
  const students = getAllStudents(criteria);
  if (!students.success) {
    return students;
  }

  const notificationsData = students.students.map(student => ({
    recipient: student.student_id,
    type: type,
    subject: subject,
    body: body
  }));

  return createBulkNotifications(notificationsData);
}

/**
 * Get unread notifications count
 */
function getUnreadNotificationsCount(recipientId) {
  const notifications = getNotifications(recipientId);
  if (!notifications.success) {
    return notifications;
  }

  const unreadCount = notifications.notifications.filter(n => n.status !== 'read').length;

  return { success: true, unreadCount };
}

/**
 * Delete old notifications (cleanup)
 */
function cleanupOldNotifications(daysOld = 30) {
  const notificationsSheet = getSheet('Notifications');
  if (!notificationsSheet) {
    return { success: false, error: 'Notifications sheet not found' };
  }

  const data = notificationsSheet.getDataRange().getValues();
  const headers = data[0];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  let deletedCount = 0;
  const rowsToDelete = [];

  // Find old notifications (iterate backwards to maintain indices)
  for (let i = data.length - 1; i >= 1; i--) {
    const notification = rowToObject(headers, data[i]);
    const sentDate = new Date(notification.sent_on);

    if (sentDate < cutoffDate && notification.status === 'read') {
      rowsToDelete.push(i + 1); // 1-based index
      deletedCount++;
    }
  }

  // Delete rows (in reverse order to maintain indices)
  rowsToDelete.sort((a, b) => b - a).forEach(rowIndex => {
    notificationsSheet.deleteRow(rowIndex);
  });

  return {
    success: true,
    deletedCount,
    message: `Cleaned up ${deletedCount} old notifications`
  };
}

/**
 * Get notification statistics
 */
function getNotificationStats() {
  const notificationsSheet = getSheet('Notifications');
  if (!notificationsSheet) {
    return { success: false, error: 'Notifications sheet not found' };
  }

  const data = notificationsSheet.getDataRange().getValues();
  const headers = data[0];

  let stats = {
    total: 0,
    sent: 0,
    read: 0,
    byType: {},
    recentActivity: []
  };

  // Last 7 days for recent activity
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  for (let i = 1; i < data.length; i++) {
    const notification = rowToObject(headers, data[i]);
    stats.total++;

    if (notification.status === 'sent') stats.sent++;
    if (notification.status === 'read') stats.read++;

    // Count by type
    const type = notification.type || 'unknown';
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Recent activity
    const sentDate = new Date(notification.sent_on);
    if (sentDate >= sevenDaysAgo) {
      stats.recentActivity.push({
        id: notification.notification_id,
        type: notification.type,
        subject: notification.subject,
        sent_on: notification.sent_on
      });
    }
  }

  // Sort recent activity by date
  stats.recentActivity.sort((a, b) => new Date(b.sent_on) - new Date(a.sent_on));
  stats.recentActivity = stats.recentActivity.slice(0, 10); // Last 10

  return { success: true, stats };
}
