// Database initialization and schema setup
// SPREADSHEET_ID is defined in Utils.js

/**
 * Setup ERP database with all required sheets and schemas
 */
function setupERP() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const schemas = {
    Students: [
      "student_id","admission_id","first_name","last_name","father_name","mother_name",
      "dob","gender","email","phone","address","programme_id","programme_name",
      "admission_date","enrollment_status","year_of_study","photo_drive_file_id",
      "hostel_alloc_id","library_card_id","created_at","updated_at"
    ],
    Admissions: [
      "admission_id","application_ref","applicant_name","first_name","last_name",
      "email","phone","programme_applied","documents","applied_on","status",
      "assigned_officer_id","verifier_notes","admitted_on","student_id",
      "created_at","updated_at"
    ],
    Users: [
      "user_id","username","email","display_name","role","hashed_password",
      "auth_provider","last_login","active","created_at","updated_at","notes"
    ],
    FeeMaster: [
      "fee_id","programme_id","component","amount","currency",
      "effective_from","effective_to","category","created_at","updated_at"
    ],
    Transactions: [
      "txn_id","student_id","admission_id","date","amount","currency","payment_mode",
      "gateway_ref","payment_status","receipt_id","created_by","created_at","notes"
    ],
    Receipts: [
      "receipt_id","txn_id","issued_by","issued_on","pdf_drive_file_id","email_sent","created_at"
    ],
    HostelRooms: [
      "room_id","hostel","block","floor","room_no","bed_no","capacity","current_student_id",
      "status","allocated_on","released_on","amenities","rent_per_month","created_at","updated_at"
    ],
    HostelAllocations: [
      "alloc_id","student_id","room_id","allocated_by","allocated_on","released_on","reason",
      "status","created_at","updated_at"
    ],
    Courses: [
      "course_id","title","credits","programme_id","semester","created_at","updated_at"
    ],
    Enrollments: [
      "enroll_id","student_id","course_id","enrolled_on","status","grade","marks",
      "created_at","updated_at"
    ],
    Exams: [
      "exam_id","course_id","exam_date","venue","invigilator_id","created_at","updated_at"
    ],
    Marks: [
      "marks_id","exam_id","student_id","marks_obtained","grade","entered_by","entered_on"
    ],
    LibraryItems: [
      "item_id","title","author","publisher","copy_no","status","borrower_id","due_date",
      "fines","created_at","updated_at"
    ],
    BorrowHistory: [
      "borrow_id","item_id","student_id","borrowed_on","returned_on","fine_amount","created_at"
    ],
    AuditLog: [
      "log_id","sheet_name","entity_id","action","user_id","timestamp","diff","notes"
    ],
    Config: [
      "config_key","json_value","updated_at"
    ],
    Notifications: [
      "notification_id","recipient","type","subject","body","sent_on","status","response"
    ],
    Files: [
      "file_id","owner_entity","file_name","mime_type","drive_folder_id","created_at","access","notes"
    ]
  };

  for (let sheetName in schemas) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      Logger.log(`Created sheet: ${sheetName}`);
    } else {
      sheet.clear(); // reset old sheet if exists
      Logger.log(`Reset sheet: ${sheetName}`);
    }
    sheet.getRange(1, 1, 1, schemas[sheetName].length).setValues([schemas[sheetName]]);
  }

  Logger.log("All tables created with headers ✅");
}

/**
 * Initialize default admin user
 */
function initializeAdminUser() {
  const adminData = {
    username: 'admin',
    email: 'admin@college.edu',
    display_name: 'System Administrator',
    role: 'admin',
    password: 'admin123',
    active: true
  };

  const result = createUser(adminData);
  if (result.success) {
    Logger.log('Admin user created successfully');
    Logger.log('Default admin credentials:');
    Logger.log('Email: admin@college.edu');
    Logger.log('Password: admin123');
  } else {
    Logger.log('Admin user creation failed: ' + result.error);
  }
}

/**
 * Initialize sample data for testing
 */
function initializeSampleData() {
  try {
    // Create sample users
    const sampleUsers = [
      {
        username: 'staff1',
        email: 'staff@college.edu',
        display_name: 'Staff Member',
        role: 'staff',
        password: 'password',
        active: true
      },
      {
        username: 'warden1',
        email: 'warden@college.edu',
        display_name: 'Hostel Warden',
        role: 'hostel_warden',
        password: 'password',
        active: true
      },
      {
        username: 'student1',
        email: 'student@college.edu',
        display_name: 'John Doe',
        role: 'student',
        password: 'password',
        active: true
      }
    ];

    sampleUsers.forEach(userData => {
      const result = createUser(userData);
      if (result.success) {
        Logger.log(`Sample user created: ${userData.username}`);
      }
    });

    // Create sample admission
    const sampleAdmission = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567890',
      programme_applied: 'Computer Science'
    };

    const admissionResult = createAdmission(sampleAdmission);
    if (admissionResult.success) {
      Logger.log('Sample admission created');
    }

    Logger.log('Sample data initialized successfully');

  } catch (error) {
    Logger.log('Error initializing sample data: ' + error.toString());
  }
}

/**
 * Test database setup and connections
 */
function testSetup() {
  try {
    // Test spreadsheet access
    const ss = getSpreadsheet();
    Logger.log('Spreadsheet access: ✅');

    // Test sheet access
    const sheets = ['Users', 'Admissions', 'Students', 'AuditLog'];
    sheets.forEach(sheetName => {
      const sheet = getSheet(sheetName);
      if (sheet) {
        Logger.log(`${sheetName} sheet access: ✅`);
      } else {
        Logger.log(`${sheetName} sheet access: ❌`);
      }
    });

    // Test utility functions
    const testId = generateId('TEST');
    Logger.log(`ID generation: ✅ (${testId})`);

    const testHash = hashPassword('test');
    Logger.log(`Password hashing: ✅`);

    Logger.log('Setup test completed successfully');

  } catch (error) {
    Logger.log('Setup test failed: ' + error.toString());
  }
}

/**
 * Reset entire database (WARNING: This deletes all data)
 */
function resetDatabase() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'WARNING',
    'This will delete ALL data in the spreadsheet. Are you sure you want to continue?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    const ss = getSpreadsheet();
    const sheets = ss.getSheets();

    // Delete all sheets except the first one, then recreate
    for (let i = sheets.length - 1; i > 0; i--) {
      ss.deleteSheet(sheets[i]);
    }

    // Clear the first sheet and rename it
    sheets[0].clear();
    sheets[0].setName('Temp');

    Logger.log('Database reset initiated. Run setupERP() to recreate tables.');
  } else {
    Logger.log('Database reset cancelled');
  }
}

/**
 * Get database statistics
 */
function getDatabaseStats() {
  const stats = {
    sheets: {},
    totalRecords: 0,
    lastUpdated: new Date().toISOString()
  };

  const ss = getSpreadsheet();
  const sheets = ss.getSheets();

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    const rowCount = sheet.getLastRow() - 1; // Subtract header row
    stats.sheets[sheetName] = rowCount;
    stats.totalRecords += rowCount;
  });

  Logger.log('Database Statistics:');
  Logger.log(JSON.stringify(stats, null, 2));

  return stats;
}
