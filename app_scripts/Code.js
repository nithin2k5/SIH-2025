// Main ERP API Functions
// Database operations are now in Database.js

/**
 * Get API documentation
 */
function getAPIDocumentation() {
  const docs = {
    base_url: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
    setup_instructions: [
      "1. Deploy this Apps Script as a web app",
      "2. Replace YOUR_SCRIPT_ID with your actual script ID",
      "3. Set 'Execute as: Me' and 'Who has access: Anyone'",
      "4. Run setupERP() to initialize database",
      "5. Run initializeAdminUser() to create admin account"
    ],
    admissions_url: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?path=admissions",
    endpoints: {
      // Authentication
      "POST /auth/login": {
        description: "Authenticate user",
        body: {
          email: "string (required)",
          password: "string (required)"
        }
      },
      "POST /auth/register": {
        description: "Register new user",
        body: {
          username: "string (required)",
          email: "string (required)",
          password: "string (required)",
          role: "string (required): admin|staff|student|hostel_warden",
          display_name: "string (optional)"
        }
      },
      "POST /auth/change-password": {
        description: "Change user password",
        body: {
          user_id: "string (required)",
          old_password: "string (required)",
          new_password: "string (required)"
        }
      },

      // User Management
      "GET /users": {
        description: "Get all users with optional filters",
        query: {
          role: "string (optional)",
          active: "boolean (optional)"
        }
      },
      "GET /users/profile": {
        description: "Get user profile",
        query: { user_id: "string (required)" }
      },
      "POST /users/create": {
        description: "Create new user",
        body: "Same as /auth/register"
      },
      "POST /users/update": {
        description: "Update user",
        body: {
          user_id: "string (required)",
          ... "any user fields to update"
        }
      },
      "POST /users/delete": {
        description: "Delete user (soft delete)",
        body: { user_id: "string (required)" }
      },

      // Admissions
      "GET /admissions": {
        description: "Get all admissions with optional filters",
        query: {
          status: "string (optional)",
          programme: "string (optional)",
          email: "string (optional)"
        }
      },
      "GET /admissions/my": {
        description: "Get admissions for specific email",
        query: { email: "string (required)" }
      },
      "GET /admissions/stats": {
        description: "Get admission statistics"
      },
      "POST /admissions/create": {
        description: "Create new admission application",
        body: {
          first_name: "string (required)",
          last_name: "string (required)",
          email: "string (required)",
          phone: "string (required)",
          programme_applied: "string (required)",
          documents: "string (optional)"
        }
      },
      "POST /admissions/update": {
        description: "Update admission details",
        body: {
          admission_id: "string (required)",
          ... "any admission fields to update"
        }
      },
      "POST /admissions/update-status": {
        description: "Update admission status",
        body: {
          admission_id: "string (required)",
          status: "string (required): pending|under_review|approved|rejected|admitted",
          verifier_notes: "string (optional)",
          assigned_officer_id: "string (optional)"
        }
      },
      "POST /admissions/admit-student": {
        description: "Convert approved admission to student",
        body: {
          admission_id: "string (required)",
          student_data: {
            father_name: "string (optional)",
            mother_name: "string (optional)",
            dob: "string (optional)",
            gender: "string (optional)",
            address: "string (optional)",
            programme_id: "string (optional)",
            photo_drive_file_id: "string (optional)"
          }
        }
      },
      "POST /admissions/delete": {
        description: "Delete admission",
        body: { admission_id: "string (required)" }
      },

      // Students
      "GET /students": {
        description: "Get all students with optional filters",
        query: {
          programme_id: "string (optional)",
          enrollment_status: "string (optional)",
          year_of_study: "number (optional)"
        }
      },
      "POST /students/create": {
        description: "Create new student",
        body: {
          student_id: "string (required)",
          first_name: "string (required)",
          last_name: "string (required)",
          email: "string (required)",
          ... "other student fields"
        }
      },
      "POST /students/update": {
        description: "Update student",
        body: {
          student_id: "string (required)",
          ... "fields to update"
        }
      },
      "POST /students/delete": {
        description: "Delete student",
        body: { student_id: "string (required)" }
      },

      // Courses
      "GET /courses": {
        description: "Get all courses with optional filters",
        query: {
          programme_id: "string (optional)",
          semester: "number (optional)"
        }
      },
      "POST /courses/create": {
        description: "Create new course",
        body: {
          course_id: "string (required)",
          title: "string (required)",
          credits: "number (required)",
          programme_id: "string (required)",
          semester: "number (optional)"
        }
      },
      "POST /courses/update": {
        description: "Update course",
        body: {
          course_id: "string (required)",
          ... "fields to update"
        }
      },
      "POST /courses/delete": {
        description: "Delete course",
        body: { course_id: "string (required)" }
      },

      // Fees
      "GET /fees": {
        description: "Get payments or student fees",
        query: {
          student_id: "string (optional)",
          payment_status: "string (optional)",
          start_date: "string (optional)",
          end_date: "string (optional)"
        }
      },
      "GET /fees/structures": {
        description: "Get fee structures",
        query: {
          programme_id: "string (optional)",
          category: "string (optional)"
        }
      },
      "POST /fees/payment": {
        description: "Create payment",
        body: {
          student_id: "string (required)",
          amount: "number (required)",
          payment_mode: "string (required)",
          ... "other payment fields"
        }
      },
      "GET /fees/receipts": {
        description: "Get receipts",
        query: {
          txn_id: "string (optional)",
          issued_by: "string (optional)"
        }
      },

      // Hostel
      "GET /hostel/rooms": {
        description: "Get hostel rooms",
        query: {
          hostel: "string (optional)",
          status: "string (optional)",
          floor: "number (optional)"
        }
      },
      "GET /hostel/allocations": {
        description: "Get hostel allocations",
        query: {
          student_id: "string (optional)",
          room_id: "string (optional)",
          status: "string (optional)"
        }
      },
      "POST /hostel/allocate": {
        description: "Allocate room to student",
        body: {
          student_id: "string (required)",
          room_id: "string (required)",
          allocated_by: "string (optional)",
          reason: "string (optional)"
        }
      },
      "POST /hostel/deallocate": {
        description: "Deallocate room from student",
        body: {
          student_id: "string (required)",
          reason: "string (optional)"
        }
      },

      // Exams
      "GET /exams": {
        description: "Get exams with filters",
        query: {
          course_id: "string (optional)",
          invigilator_id: "string (optional)",
          start_date: "string (optional)",
          end_date: "string (optional)"
        }
      },
      "POST /exams/create": {
        description: "Create exam",
        body: {
          exam_id: "string (required)",
          course_id: "string (required)",
          exam_date: "string (required)",
          venue: "string (optional)",
          invigilator_id: "string (optional)"
        }
      },
      "POST /exams/update": {
        description: "Update exam",
        body: {
          exam_id: "string (required)",
          ... "fields to update"
        }
      },
      "POST /exams/delete": {
        description: "Delete exam",
        body: { exam_id: "string (required)" }
      },
      "POST /exams/marks": {
        description: "Enter exam marks",
        body: {
          exam_id: "string (required)",
          student_id: "string (required)",
          marks_obtained: "number (required)",
          entered_by: "string (optional)"
        }
      },
      "GET /exams/results": {
        description: "Get exam results",
        query: {
          student_id: "string (optional)",
          exam_id: "string (optional)"
        }
      },

      // Dashboard
      "GET /dashboard/stats": {
        description: "Get dashboard statistics"
      },
      "GET /dashboard/student": {
        description: "Get student dashboard stats",
        query: { student_id: "string (required)" }
      },
      "GET /dashboard/activity": {
        description: "Get recent activity",
        query: { limit: "number (optional, default: 10)" }
      },
      "GET /dashboard/health": {
        description: "Get system health metrics"
      },

      // Notifications
      "GET /notifications": {
        description: "Get notifications for user",
        query: { recipient: "string (required)" }
      },
      "POST /notifications/create": {
        description: "Create notification",
        body: {
          recipient: "string (required)",
          type: "string (required)",
          subject: "string (required)",
          body: "string (required)"
        }
      },
      "POST /notifications/update": {
        description: "Update notification",
        body: {
          notification_id: "string (required)",
          ... "fields to update"
        }
      },
      "POST /notifications/mark-read": {
        description: "Mark notification as read",
        body: { notification_id: "string (required)" }
      },

      // Audit
      "GET /audit/logs": {
        description: "Get audit logs with optional filters",
        query: {
          sheet_name: "string (optional)",
          entity_id: "string (optional)",
          action: "string (optional)",
          user_id: "string (optional)",
          start_date: "string (optional)",
          end_date: "string (optional)"
        }
      }
    }
  };

  return docs;
}

/**
 * Get important URLs for the system
 */
function getSystemURLs() {
  const baseUrl = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

  return {
    base_url: baseUrl,
    admissions: {
      get_all: `${baseUrl}?path=admissions`,
      get_my: `${baseUrl}?path=admissions/my`,
      get_stats: `${baseUrl}?path=admissions/stats`,
      create: `${baseUrl}?path=admissions/create`,
      update: `${baseUrl}?path=admissions/update`,
      update_status: `${baseUrl}?path=admissions/update-status`,
      admit_student: `${baseUrl}?path=admissions/admit-student`,
      delete: `${baseUrl}?path=admissions/delete`
    },
    auth: {
      login: `${baseUrl}?path=auth/login`,
      register: `${baseUrl}?path=auth/register`,
      change_password: `${baseUrl}?path=auth/change-password`
    },
    users: {
      get_all: `${baseUrl}?path=users`,
      get_profile: `${baseUrl}?path=users/profile`,
      create: `${baseUrl}?path=users/create`,
      update: `${baseUrl}?path=users/update`,
      delete: `${baseUrl}?path=users/delete`
    },
    audit: {
      logs: `${baseUrl}?path=audit/logs`
    },
    instructions: [
      "Replace YOUR_SCRIPT_ID with your actual Google Apps Script ID",
      "To find your script ID:",
      "1. Open your deployed web app",
      "2. Copy the ID from the URL between '/s/' and '/exec'",
      "Example: https://script.google.com/macros/s/ABC123/exec",
      "Your script ID is: ABC123"
    ]
  };
}
