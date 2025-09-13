function setupERP() {
  const ss = SpreadsheetApp.openById("1WIw-XsaBR7m7_vODyiHHVXloeWh9QV1AXb79fTnMkaw");

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
    } else {
      sheet.clear(); // reset old sheet if exists
    }
    sheet.getRange(1, 1, 1, schemas[sheetName].length).setValues([schemas[sheetName]]);
  }

  Logger.log("All tables created with headers ✅");
}
