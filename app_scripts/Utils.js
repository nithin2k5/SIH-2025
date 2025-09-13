// Utility functions for ERP system
const SPREADSHEET_ID = "1WIw-XsaBR7m7_vODyiHHVXloeWh9QV1AXb79fTnMkaw";

/**
 * Get spreadsheet instance
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Get sheet by name
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  return ss.getSheetByName(sheetName);
}

/**
 * Generate unique ID
 */
function generateId(prefix = '') {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}${timestamp}${random}`;
}

/**
 * Get current timestamp in ISO format
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Find row by ID in a sheet
 */
function findRowById(sheet, idColumn, id) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Find ID column index
  const idColumnIndex = headers.indexOf(idColumn);
  if (idColumnIndex === -1) return null;

  // Find row with matching ID
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumnIndex] == id) {
      return {
        rowIndex: i + 1, // 1-based index
        rowData: data[i]
      };
    }
  }
  return null;
}

/**
 * Convert row data to object using headers
 */
function rowToObject(headers, rowData) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = rowData[index];
  });
  return obj;
}

/**
 * Hash password using Utilities
 */
function hashPassword(password) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
    .map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    })
    .join('');
}

/**
 * Verify password hash
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * Send JSON response
 */
function sendJsonResponse(data, status = 200) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status,
      data,
      timestamp: getCurrentTimestamp()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Send error response
 */
function sendErrorResponse(message, status = 400) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status,
      error: message,
      timestamp: getCurrentTimestamp()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Validate required fields
 */
function validateRequired(data, requiredFields) {
  const missing = requiredFields.filter(field => !data[field] || data[field] === '');
  return missing.length > 0 ? missing : null;
}

/**
 * Parse JSON request body
 */
function parseJsonRequest(request) {
  try {
    return JSON.parse(request.postData.contents);
  } catch (e) {
    return null;
  }
}
