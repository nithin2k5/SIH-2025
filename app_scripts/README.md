# College ERP - Google Apps Script API

This Google Apps Script project provides a REST API for the College ERP system, handling authentication and admissions management.

## Setup

1. **Deploy the script**:
   - Open Google Apps Script editor
   - Copy all files from this directory
   - Deploy as web app with "Execute as: Me" and "Who has access: Anyone"

2. **Initialize the system**:
   ```javascript
   // Run these functions in order:
   setupERP(); // Creates all sheets with headers
   initializeAdminUser(); // Creates default admin user
   testSetup(); // Verify setup
   // Optional: initializeSampleData(); // Add sample data
   ```

3. **Get your API URLs**:
   ```javascript
   const urls = getSystemURLs();
   Logger.log(JSON.stringify(urls, null, 2));
   ```

3. **Default Admin Credentials**:
   - Email: `admin@college.edu`
   - Password: `admin123`

## API Endpoints

Base URL: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`

### Authentication

#### POST `/auth/login`
Authenticate a user.

**Request Body:**
```json
{
  "email": "admin@college.edu",
  "password": "admin123"
}
```

**Response:**
```json
{
  "status": 200,
  "data": {
    "success": true,
    "user": {
      "user_id": "USR001",
      "username": "admin",
      "email": "admin@college.edu",
      "display_name": "System Administrator",
      "role": "admin"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "display_name": "John Doe"
}
```

#### POST `/auth/change-password`
Change user password.

**Request Body:**
```json
{
  "user_id": "USR001",
  "old_password": "oldpassword",
  "new_password": "newpassword"
}
```

### User Management

#### GET `/users`
Get all users with optional filters.

**Query Parameters:**
- `role` (optional): Filter by role
- `active` (optional): Filter by active status

**Example:** `?role=student&active=true`

#### GET `/users/profile`
Get user profile by ID.

**Query Parameters:**
- `user_id` (required): User ID

#### POST `/users/create`
Create new user (same as register).

#### POST `/users/update`
Update user information.

**Request Body:**
```json
{
  "user_id": "USR001",
  "display_name": "Updated Name",
  "active": true
}
```

#### POST `/users/delete`
Soft delete user.

**Request Body:**
```json
{
  "user_id": "USR001"
}
```

### Admissions Management

#### GET `/admissions`
Get all admissions with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status
- `programme` (optional): Filter by programme
- `email` (optional): Filter by email

#### GET `/admissions/my`
Get admissions for a specific email.

**Query Parameters:**
- `email` (required): Applicant's email

#### GET `/admissions/stats`
Get admission statistics.

**Response:**
```json
{
  "status": 200,
  "data": {
    "success": true,
    "stats": {
      "total": 25,
      "pending": 10,
      "under_review": 5,
      "approved": 8,
      "rejected": 2,
      "admitted": 0
    }
  }
}
```

#### POST `/admissions/create`
Create new admission application.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "programme_applied": "Computer Science",
  "documents": "transcript.pdf, id.pdf"
}
```

#### POST `/admissions/update`
Update admission details.

**Request Body:**
```json
{
  "admission_id": "ADM001",
  "phone": "+1987654321",
  "documents": "updated_transcript.pdf"
}
```

#### POST `/admissions/update-status`
Update admission status (for staff/admin).

**Request Body:**
```json
{
  "admission_id": "ADM001",
  "status": "approved",
  "verifier_notes": "All documents verified",
  "assigned_officer_id": "USR002"
}
```

#### POST `/admissions/admit-student`
Convert approved admission to student record.

**Request Body:**
```json
{
  "admission_id": "ADM001",
  "student_data": {
    "father_name": "John Sr.",
    "mother_name": "Jane Doe",
    "dob": "2000-01-01",
    "gender": "male",
    "address": "123 Main St",
    "programme_id": "CS001",
    "photo_drive_file_id": "file123"
  }
}
```

#### POST `/admissions/delete`
Delete admission application.

**Request Body:**
```json
{
  "admission_id": "ADM001"
}
```

### Students Management

#### GET `/students`
Get all students with optional filters.

**Query Parameters:**
- `programme_id` (optional): Filter by programme
- `enrollment_status` (optional): Filter by status
- `year_of_study` (optional): Filter by year

#### POST `/students/create`
Create new student.

**Request Body:**
```json
{
  "student_id": "STD001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "programme_id": "CS001",
  "enrollment_status": "active",
  "year_of_study": 1
}
```

#### POST `/students/update`
Update student information.

**Request Body:**
```json
{
  "student_id": "STD001",
  "phone": "+1987654321",
  "year_of_study": 2
}
```

#### POST `/students/delete`
Delete student (soft delete).

**Request Body:**
```json
{
  "student_id": "STD001"
}
```

### Courses Management

#### GET `/courses`
Get all courses with optional filters.

**Query Parameters:**
- `programme_id` (optional): Filter by programme
- `semester` (optional): Filter by semester

#### POST `/courses/create`
Create new course.

**Request Body:**
```json
{
  "course_id": "CS101",
  "title": "Data Structures",
  "credits": 4,
  "programme_id": "CS001",
  "semester": 3
}
```

#### POST `/courses/update`
Update course information.

#### POST `/courses/delete`
Delete course.

### Fees Management

#### GET `/fees`
Get payments or student fees.

**Query Parameters:**
- `student_id` (optional): Get fees for specific student
- `payment_status` (optional): Filter by status
- `start_date` (optional): Start date filter
- `end_date` (optional): End date filter

#### GET `/fees/structures`
Get fee structures.

**Query Parameters:**
- `programme_id` (optional): Filter by programme
- `category` (optional): Filter by category

#### POST `/fees/payment`
Create payment.

**Request Body:**
```json
{
  "student_id": "STD001",
  "amount": 50000,
  "payment_mode": "online",
  "created_by": "admin"
}
```

#### GET `/fees/receipts`
Get receipts.

### Hostel Management

#### GET `/hostel/rooms`
Get hostel rooms.

**Query Parameters:**
- `hostel` (optional): Filter by hostel
- `status` (optional): Filter by status
- `floor` (optional): Filter by floor

#### GET `/hostel/allocations`
Get hostel allocations.

#### POST `/hostel/allocate`
Allocate room to student.

**Request Body:**
```json
{
  "student_id": "STD001",
  "room_id": "ROOM001",
  "allocated_by": "warden",
  "reason": "Regular allocation"
}
```

#### POST `/hostel/deallocate`
Deallocate room from student.

### Exams Management

#### GET `/exams`
Get exams with filters.

#### POST `/exams/create`
Create exam.

**Request Body:**
```json
{
  "exam_id": "EXAM001",
  "course_id": "CS101",
  "exam_date": "2024-12-15T10:00:00Z",
  "venue": "Hall A",
  "invigilator_id": "STF001"
}
```

#### POST `/exams/marks`
Enter exam marks.

**Request Body:**
```json
{
  "exam_id": "EXAM001",
  "student_id": "STD001",
  "marks_obtained": 85,
  "entered_by": "professor"
}
```

#### GET `/exams/results`
Get exam results.

### Dashboard

#### GET `/dashboard/stats`
Get dashboard statistics.

#### GET `/dashboard/student`
Get student dashboard stats.

**Query Parameters:**
- `student_id` (required): Student ID

#### GET `/dashboard/activity`
Get recent activity.

#### GET `/dashboard/health`
Get system health metrics.

### Notifications

#### GET `/notifications`
Get notifications for user.

**Query Parameters:**
- `recipient` (required): User ID

#### POST `/notifications/create`
Create notification.

**Request Body:**
```json
{
  "recipient": "STD001",
  "type": "announcement",
  "subject": "Exam Schedule",
  "body": "Mid-term exams start next week"
}
```

### Audit Logs

#### GET `/audit/logs`
Get audit logs with optional filters.

**Query Parameters:**
- `sheet_name` (optional): Filter by sheet
- `entity_id` (optional): Filter by entity ID
- `action` (optional): Filter by action
- `user_id` (optional): Filter by user
- `start_date` (optional): Start date (ISO format)
- `end_date` (optional): End date (ISO format)

## Error Responses

All endpoints return errors in this format:

```json
{
  "status": 400,
  "error": "Error message",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Status Codes

- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Data Schemas

### Users Table
- `user_id`: Unique identifier
- `username`: Username
- `email`: Email address
- `display_name`: Display name
- `role`: admin|staff|student|hostel_warden
- `hashed_password`: SHA-256 hashed password
- `auth_provider`: Authentication provider
- `last_login`: Last login timestamp
- `active`: Boolean status
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp
- `notes`: Additional notes

### Admissions Table
- `admission_id`: Unique identifier
- `application_ref`: Application reference number
- `applicant_name`: Full name
- `first_name`: First name
- `last_name`: Last name
- `email`: Email address
- `phone`: Phone number
- `programme_applied`: Applied programme
- `documents`: Document references
- `applied_on`: Application timestamp
- `status`: pending|under_review|approved|rejected|admitted
- `assigned_officer_id`: Assigned officer ID
- `verifier_notes`: Verification notes
- `admitted_on`: Admission timestamp
- `student_id`: Generated student ID
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

## Usage Examples

### Using curl

```bash
# Login
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?path=auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"admin123"}'

# Create admission
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?path=admissions/create" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"John",
    "last_name":"Doe",
    "email":"john@example.com",
    "phone":"+1234567890",
    "programme_applied":"Computer Science"
  }'

# Get admissions
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?path=admissions&status=pending"
```

### Using JavaScript (Frontend)

```javascript
// Login function
async function login(email, password) {
  const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?path=auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();
  return result;
}

// Create admission
async function createAdmission(admissionData) {
  const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?path=admissions/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(admissionData)
  });

  const result = await response.json();
  return result;
}
```

## Security Notes

- Passwords are hashed using SHA-256
- All actions are logged in the AuditLog sheet
- User sessions should be managed on the frontend
- Consider implementing rate limiting for production use
- Validate all inputs on both frontend and backend

## Development

To test functions locally in Apps Script editor:
1. Use the Logger to debug
2. Test individual functions
3. Use `testSetup()` to verify configuration
4. Check execution logs for errors

## File Structure

```
app_scripts/
├── Code.js          # Main setup and API documentation
├── Utils.js         # Utility functions
├── Auth.js          # Authentication functions
├── Admissions.js    # Admissions management functions
├── Audit.js         # Audit logging functions
├── API.js           # HTTP request handlers (doPost/doGet)
├── appsscript.json  # Apps Script configuration
└── README.md        # This documentation
```
