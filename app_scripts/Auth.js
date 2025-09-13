// Authentication functions
const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student',
  HOSTEL_WARDEN: 'hostel_warden'
};

/**
 * Authenticate user login
 */
function login(email, password) {
  const usersSheet = getSheet('Users');
  if (!usersSheet) {
    return { success: false, error: 'Users sheet not found' };
  }

  const data = usersSheet.getDataRange().getValues();
  const headers = data[0];

  // Find user by email
  for (let i = 1; i < data.length; i++) {
    const userData = data[i];
    const user = rowToObject(headers, userData);

    if (user.email === email) {
      // Check if user is active
      if (!user.active) {
        return { success: false, error: 'Account is inactive' };
      }

      // Verify password
      if (verifyPassword(password, user.hashed_password)) {
        // Update last login
        const rowIndex = i + 1;
        usersSheet.getRange(rowIndex, headers.indexOf('last_login') + 1).setValue(getCurrentTimestamp());

        // Log audit
        logAudit('Users', user.user_id, 'login', null, { user_id: user.user_id });

        return {
          success: true,
          user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            display_name: user.display_name,
            role: user.role
          }
        };
      } else {
        return { success: false, error: 'Invalid password' };
      }
    }
  }

  return { success: false, error: 'User not found' };
}

/**
 * Create new user
 */
function createUser(userData) {
  // Validate required fields
  const required = ['username', 'email', 'password', 'role'];
  const missing = validateRequired(userData, required);
  if (missing) {
    return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  // Validate role
  if (!Object.values(USER_ROLES).includes(userData.role)) {
    return { success: false, error: 'Invalid role' };
  }

  const usersSheet = getSheet('Users');
  if (!usersSheet) {
    return { success: false, error: 'Users sheet not found' };
  }

  // Check if user already exists
  const existingUser = findRowById(usersSheet, 'email', userData.email);
  if (existingUser) {
    return { success: false, error: 'User with this email already exists' };
  }

  // Create new user
  const userId = generateId('USR');
  const now = getCurrentTimestamp();

  const newUser = {
    user_id: userId,
    username: userData.username,
    email: userData.email,
    display_name: userData.display_name || userData.username,
    role: userData.role,
    hashed_password: hashPassword(userData.password),
    auth_provider: 'local',
    last_login: null,
    active: true,
    created_at: now,
    updated_at: now,
    notes: userData.notes || ''
  };

  // Add to sheet
  const headers = usersSheet.getRange(1, 1, 1, usersSheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(header => newUser[header] || '');

  usersSheet.appendRow(rowData);

  // Log audit
  logAudit('Users', userId, 'create', null, newUser);

  return {
    success: true,
    user: {
      user_id: userId,
      username: newUser.username,
      email: newUser.email,
      display_name: newUser.display_name,
      role: newUser.role
    }
  };
}

/**
 * Get user by ID
 */
function getUser(userId) {
  const usersSheet = getSheet('Users');
  if (!usersSheet) {
    return { success: false, error: 'Users sheet not found' };
  }

  const result = findRowById(usersSheet, 'user_id', userId);
  if (!result) {
    return { success: false, error: 'User not found' };
  }

  const headers = usersSheet.getRange(1, 1, 1, usersSheet.getLastColumn()).getValues()[0];
  const user = rowToObject(headers, result.rowData);

  // Remove sensitive data
  delete user.hashed_password;

  return { success: true, user };
}

/**
 * Update user
 */
function updateUser(userId, updateData) {
  const usersSheet = getSheet('Users');
  if (!usersSheet) {
    return { success: false, error: 'Users sheet not found' };
  }

  const result = findRowById(usersSheet, 'user_id', userId);
  if (!result) {
    return { success: false, error: 'User not found' };
  }

  const headers = usersSheet.getRange(1, 1, 1, usersSheet.getLastColumn()).getValues()[0];
  const currentUser = rowToObject(headers, result.rowData);

  // Update fields
  const updatedUser = { ...currentUser, ...updateData, updated_at: getCurrentTimestamp() };

  // Hash password if provided
  if (updateData.password) {
    updatedUser.hashed_password = hashPassword(updateData.password);
  }

  // Update row
  const rowData = headers.map(header => updatedUser[header] || '');
  usersSheet.getRange(result.rowIndex, 1, 1, headers.length).setValues([rowData]);

  // Log audit
  logAudit('Users', userId, 'update', currentUser, updatedUser);

  return { success: true, user: updatedUser };
}

/**
 * Delete user (soft delete by setting active to false)
 */
function deleteUser(userId) {
  const usersSheet = getSheet('Users');
  if (!usersSheet) {
    return { success: false, error: 'Users sheet not found' };
  }

  const result = findRowById(usersSheet, 'user_id', userId);
  if (!result) {
    return { success: false, error: 'User not found' };
  }

  const headers = usersSheet.getRange(1, 1, 1, usersSheet.getLastColumn()).getValues()[0];

  // Set active to false
  usersSheet.getRange(result.rowIndex, headers.indexOf('active') + 1).setValue(false);
  usersSheet.getRange(result.rowIndex, headers.indexOf('updated_at') + 1).setValue(getCurrentTimestamp());

  // Log audit
  logAudit('Users', userId, 'delete', null, { user_id: userId });

  return { success: true };
}

/**
 * Get all users (admin only)
 */
function getAllUsers(filters = {}) {
  const usersSheet = getSheet('Users');
  if (!usersSheet) {
    return { success: false, error: 'Users sheet not found' };
  }

  const data = usersSheet.getDataRange().getValues();
  const headers = data[0];

  let users = [];

  for (let i = 1; i < data.length; i++) {
    const user = rowToObject(headers, data[i]);

    // Apply filters
    if (filters.role && user.role !== filters.role) continue;
    if (filters.active !== undefined && user.active !== filters.active) continue;

    // Remove sensitive data
    delete user.hashed_password;
    users.push(user);
  }

  return { success: true, users };
}

/**
 * Change user password
 */
function changePassword(userId, oldPassword, newPassword) {
  const usersSheet = getSheet('Users');
  if (!usersSheet) {
    return { success: false, error: 'Users sheet not found' };
  }

  const result = findRowById(usersSheet, 'user_id', userId);
  if (!result) {
    return { success: false, error: 'User not found' };
  }

  const headers = usersSheet.getRange(1, 1, 1, usersSheet.getLastColumn()).getValues()[0];
  const user = rowToObject(headers, result.rowData);

  // Verify old password
  if (!verifyPassword(oldPassword, user.hashed_password)) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Update password
  const newHash = hashPassword(newPassword);
  usersSheet.getRange(result.rowIndex, headers.indexOf('hashed_password') + 1).setValue(newHash);
  usersSheet.getRange(result.rowIndex, headers.indexOf('updated_at') + 1).setValue(getCurrentTimestamp());

  // Log audit
  logAudit('Users', userId, 'password_change', null, { user_id: userId });

  return { success: true };
}
