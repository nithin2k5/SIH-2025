// API Endpoints for Google Apps Script

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
