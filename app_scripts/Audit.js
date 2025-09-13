// Audit logging functions

/**
 * Log audit event
 */
function logAudit(sheetName, entityId, action, oldData = null, newData = null) {
  const auditSheet = getSheet('AuditLog');
  if (!auditSheet) {
    Logger.log('AuditLog sheet not found - skipping audit log');
    return;
  }

  const logId = generateId('LOG');
  const now = getCurrentTimestamp();

  // Calculate diff (simplified)
  let diff = '';
  if (oldData && newData) {
    const changes = [];
    Object.keys(newData).forEach(key => {
      if (oldData[key] !== newData[key]) {
        changes.push(`${key}: ${oldData[key]} -> ${newData[key]}`);
      }
    });
    diff = changes.join('; ');
  }

  const auditLog = {
    log_id: logId,
    sheet_name: sheetName,
    entity_id: entityId,
    action: action,
    user_id: Session.getActiveUser().getEmail() || 'system',
    timestamp: now,
    diff: diff,
    notes: ''
  };

  // Add to sheet
  const headers = auditSheet.getRange(1, 1, 1, auditSheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(header => auditLog[header] || '');

  auditSheet.appendRow(rowData);
}

/**
 * Get audit logs with filters
 */
function getAuditLogs(filters = {}) {
  const auditSheet = getSheet('AuditLog');
  if (!auditSheet) {
    return { success: false, error: 'AuditLog sheet not found' };
  }

  const data = auditSheet.getDataRange().getValues();
  const headers = data[0];

  let logs = [];

  for (let i = 1; i < data.length; i++) {
    const log = rowToObject(headers, data[i]);

    // Apply filters
    if (filters.sheet_name && log.sheet_name !== filters.sheet_name) continue;
    if (filters.entity_id && log.entity_id !== filters.entity_id) continue;
    if (filters.action && log.action !== filters.action) continue;
    if (filters.user_id && log.user_id !== filters.user_id) continue;

    // Date range filter
    if (filters.start_date && new Date(log.timestamp) < new Date(filters.start_date)) continue;
    if (filters.end_date && new Date(log.timestamp) > new Date(filters.end_date)) continue;

    logs.push(log);
  }

  // Sort by timestamp descending
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return { success: true, logs };
}
