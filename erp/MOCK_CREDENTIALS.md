# Mock Login Credentials

This file contains the working login credentials for the mock ERP system.

## Admin Users
- **Email:** `admin@college.edu`
- **Password:** `admin123`
- **Role:** Administrator

- **Email:** `superadmin@college.edu`
- **Password:** `admin456`
- **Role:** Administrator

## Staff Users
- **Email:** `admissions@college.edu`
- **Password:** `staff123`
- **Role:** Staff (Admissions)

- **Email:** `accounts@college.edu`
- **Password:** `staff456`
- **Role:** Staff (Accounts)

- **Email:** `exams@college.edu`
- **Password:** `staff789`
- **Role:** Staff (Examinations)

## Hostel Wardens
- **Email:** `warden@college.edu`
- **Password:** `warden123`
- **Role:** Hostel Warden

- **Email:** `hostel@college.edu`
- **Password:** `warden456`
- **Role:** Hostel Warden

## Student Users
- **Email:** `john.doe@college.edu`
- **Password:** `student123`
- **Role:** Student (Computer Science, Semester 3)

- **Email:** `jane.smith@college.edu`
- **Password:** `student456`
- **Role:** Student (Electrical Engineering, Semester 2)

- **Email:** `mike.johnson@college.edu`
- **Password:** `student789`
- **Role:** Student (Mechanical Engineering, Semester 4)

- **Email:** `alice.wilson@college.edu`
- **Password:** `student101`
- **Role:** Student (Business Administration, Semester 1)

## How to Use
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3003/auth/login`
3. Use any of the credentials above to log in
4. The system will automatically redirect based on your role

## Troubleshooting
If login fails with "Invalid credentials":
1. Clear your browser's localStorage for the domain
2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
3. Try logging in again

The system automatically re-initializes user data if it's missing or corrupted.
