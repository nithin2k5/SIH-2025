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
