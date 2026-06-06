# The College - Server Directory Documentation 

## Overview

The server directory contains the backend implementation of the College Notes Management System. It is built using Express.js and MongoDB with a RESTful API architecture, providing various features including user authentication, note management, feedback system, and contact functionality.

## Table of Contents

1. [Server Configuration](#server-configuration)
2. [Database](#database)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Endpoints](#api-endpoints)
   - [Authentication Routes](#authentication-routes)
   - [Note Management Routes](#note-management-routes)
   - [Feedback Routes](#feedback-routes)
   - [Contact Routes](#contact-routes)
5. [Models](#models)
6. [Middleware](#middleware)
7. [Error Handling](#error-handling)
8. [File Upload Functionality](#file-upload-functionality)
9. [Email Verification](#email-verification)

## Server Configuration

The main server.js file initializes and configures the Express application:

- Middleware setup: JSON parsing, URL encoding, static file serving
- CORS configuration with specific origin, methods, and credentials
- View engine (EJS) for email verification templates
- Environment variables via dotenv
- API route definitions
- Database connection initialization
- Server port configuration (default: 4000)

## Database

The application uses MongoDB as its database, connected through Mongoose ODM:

- Connection established in `/Database/db.js`
- Uses MongoDB Atlas cloud database or local MongoDB instance
- Connection string stored securely in environment variables
- Error handling for failed connections

## Authentication & Authorization

### User Types

The system supports two types of users:

1. **Students** - Regular users who can browse and download notes
2. **Admins** - Privileged users who can manage notes, feedback, and contact requests

### Authentication Flow

1. **Registration**:
   - Users register with name, course details, enrollment number, email, and password
   - Admin registration requires name, email, and password
   - Passwords are hashed using bcrypt before storage
   - Email verification token generated and sent

2. **Email Verification**:
   - Verification link sent to user/admin email
   - JWT-based token validation
   - Account marked as verified upon successful verification

3. **Login**:
   - User/Admin provides email and password
   - System verifies credentials and email verification status
   - JWT token generated containing user ID and role
   - Token returned to client for subsequent authenticated requests

4. **Authentication Middleware**:
   - `authenticateUser` - Verifies JWT token presence and validity
   - `authorizeAdmin` - Ensures user has admin role for protected routes

## API Endpoints

format this 

## Authentication Routes

### User Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify/user/:token` - Verify user email
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/update-profile` - Update user profile

### Admin Authentication
- `POST /api/auth/signupAdmin` - Register a new admin
- `POST /api/auth/loginAdmin` - Admin login
- `GET /api/auth/verify/admin/:token` - Verify admin email

## Note Management Routes
- `POST /api/notes/upload` - Upload a note (Admin only)
- `GET /api/notes` - Get all notes
- `GET /api/notes/search` - Search and filter notes
- `DELETE /api/notes/:id` - Delete a note (Admin only)
- `PUT /api/notes/:id` - Update a note (Admin only)

## Feedback Routes
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedbacks (Admin only)
- `DELETE /api/feedback/:id` - Delete feedback (Admin only)

## Contact Routes
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact messages (Admin only)
- `DELETE /api/contact/:id` - Delete contact message (Admin only)

### Authentication Routes

#### User Authentication

1. **Register User**
   - **Route**: `POST /api/auth/signup`
   - **Body**: 
     ```json
     {
       "name": "string",
       "course": "string",
       "branch": "string",
       "enrollment": "number",
       "email": "string",
       "password": "string"
     }
     ```
   - **Response (Success)**: 
     ```json
     {
       "message": "Registration successful! Please check your email for verification."
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "User already exists" | "Server error"
     }
     ```

2. **Login User**
   - **Route**: `POST /api/auth/login`
   - **Body**: 
     ```json
     {
       "email": "string",
       "password": "string"
     }
     ```
   - **Response (Success)**: 
     ```json
     {
       "token": "JWT_TOKEN",
       "user": {
         "id": "string",
         "name": "string",
         "course": "string",
         "branch": "string",
         "enrollment": "number",
         "email": "string",
         "role": "string"
       }
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "Invalid email or password" | "User not found" | "Server error"
     }
     ```

3. **Verify User Email**
   - **Route**: `GET /api/auth/verify/user/:token`
   - **Response**: EJS template rendering verification success page
   - **Response (Error)**: 
     ```json
     {
       "message": "Invalid or expired token!" | "User not found!"
     }
     ```

4. **Get Current User Profile**
   - **Route**: `GET /api/auth/me`
   - **Authentication**: Required
   - **Response (Success)**: 
     ```json
     {
       "user": {
         "id": "string",
         "name": "string",
         "course": "string",
         "branch": "string",
         "enrollment": "number",
         "email": "string",
         "role": "string",
         "profilePic": "string"
       }
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "User not found" | "Internal server error"
     }
     ```

5. **Update User Profile**
   - **Route**: `PUT /api/auth/update-profile`
   - **Authentication**: Required
   - **Body**: Form data with `name` field and optional `profilePic` file
   - **Response (Success)**: 
     ```json
     {
       "user": {
         /* Updated user object */
       }
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "Failed to update profile"
     }
     ```

#### Admin Authentication

1. **Register Admin**
   - **Route**: `POST /api/auth/signupAdmin`
   - **Body**: 
     ```json
     {
       "name": "string",
       "email": "string",
       "password": "string"
     }
     ```
   - **Response (Success)**: 
     ```json
     {
       "message": "Registration successful! Please check your email for verification."
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "Admin already exists" | "Server error"
     }
     ```

2. **Login Admin**
   - **Route**: `POST /api/auth/loginAdmin`
   - **Body**: 
     ```json
     {
       "email": "string",
       "password": "string"
     }
     ```
   - **Response (Success)**: 
     ```json
     {
       "token": "JWT_TOKEN",
       "admin": {
         "id": "string",
         "name": "string",
         "email": "string",
         "role": "admin"
       }
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "Invalid email or password" | "Admin not found" | "Server error"
     }
     ```

3. **Verify Admin Email**
   - **Route**: `GET /api/auth/verify/admin/:token`
   - **Response**: EJS template rendering verification success page
   - **Response (Error)**: 
     ```json
     {
       "message": "Invalid or expired token!" | "Admin not found!"
     }
     ```

### Note Management Routes

1. **Upload Note (Admin Only)**
   - **Route**: `POST /api/notes/upload`
   - **Authentication**: Required (Admin)
   - **Body**: Form data with fields:
     - `title`: string
     - `description`: string
     - `session`: string
     - `course`: string
     - `branch`: string
     - `semester`: string
     - `subject`: string
     - `file`: PDF/document file
   - **Response (Success)**: 
     ```json
     {
       "message": "Note uploaded successfully!",
       "note": {
         /* Note object */
       }
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "All fields are required" | "File is required" | "Server error"
     }
     ```

2. **Get All Notes**
   - **Route**: `GET /api/notes`
   - **Authentication**: Required
   - **Response (Success)**: Array of note objects with uploader details
   - **Response (Error)**: 
     ```json
     {
       "message": "Server error"
     }
     ```

3. **Search & Filter Notes**
   - **Route**: `GET /api/notes/search`
   - **Authentication**: Required
   - **Query Parameters**: 
     - `query`: string (optional) - Search term for title, description, etc.
     - `subject`: string (optional) - Filter by subject
     - `course`: string (optional) - Filter by course
     - `semester`: string (optional) - Filter by semester
     - `branch`: string (optional) - Filter by branch
     - `session`: string (optional) - Filter by session
     - `page`: number (optional) - Page number for pagination (default: 1)
     - `limit`: number (optional) - Items per page (default: 10)
   - **Response (Success)**: Array of filtered note objects
   - **Response (Error)**: 
     ```json
     {
       "message": "Server error"
     }
     ```

4. **Delete Note (Admin Only)**
   - **Route**: `DELETE /api/notes/:id`
   - **Authentication**: Required (Admin)
   - **Response (Success)**: 
     ```json
     {
       "message": "Note deleted successfully!"
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "Note not found" | "Server error"
     }
     ```

5. **Update Note (Admin Only)**
   - **Route**: `PUT /api/notes/:id`
   - **Authentication**: Required (Admin)
   - **Body**: Form data with fields:
     - `title`: string (optional)
     - `description`: string (optional)
     - `file`: PDF/document file (optional)
   - **Response (Success)**: 
     ```json
     {
       "message": "Note updated successfully!",
       "note": {
         /* Updated note object */
       }
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "Note not found" | "Server error"
     }
     ```

### Feedback Routes

1. **Submit Feedback**
   - **Route**: `POST /api/feedback`
   - **Authentication**: Required
   - **Body**: 
     ```json
     {
       "message": "string",
       "rating": "number" // 1-5
     }
     ```
   - **Response (Success)**: 
     ```json
     {
       "message": "Feedback submitted successfully!"
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "Message and rating are required" | "Server error"
     }
     ```

2. **Get All Feedbacks (Admin Only)**
   - **Route**: `GET /api/feedback`
   - **Authentication**: Required (Admin)
   - **Response (Success)**: Array of feedback objects with user details
   - **Response (Error)**: 
     ```json
     {
       "message": "Server error"
     }
     ```

3. **Delete Feedback (Admin Only)**
   - **Route**: `DELETE /api/feedback/:id`
   - **Authentication**: Required (Admin)
   - **Response (Success)**: 
     ```json
     {
       "message": "Feedback deleted successfully"
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "Feedback not found" | "Server error"
     }
     ```

### Contact Routes

1. **Submit Contact Form**
   - **Route**: `POST /api/contact`
   - **Authentication**: Required
   - **Body**: 
     ```json
     {
       "name": "string",
       "email": "string",
       "phone": "string",
       "message": "string"
     }
     ```
   - **Response (Success)**: 
     ```json
     {
       "message": "Form submitted successfully!"
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "Name, Email, Phone and Message are required" | "Server error"
     }
     ```

2. **Get All Contact Messages (Admin Only)**
   - **Route**: `GET /api/contact`
   - **Authentication**: Required (Admin)
   - **Response (Success)**: Array of contact message objects with user details
   - **Response (Error)**: 
     ```json
     {
       "message": "Server error"
     }
     ```

3. **Delete Contact Message (Admin Only)**
   - **Route**: `DELETE /api/contact/:id`
   - **Authentication**: Required (Admin)
   - **Response (Success)**: 
     ```json
     {
       "message": "Contact Message deleted successfully"
     }
     ```
   - **Response (Error)**: 
     ```json
     {
       "message": "Contact not found" | "Server error"
     }
     ```

## Models

### User Model

```javascript
{
  name: { type: String, required: true },
  course: { type: String, required: true },
  branch: { type: String, required: true },
  enrollment: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  timestamps: true
}
```

### Admin Model

```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  isVerified: { type: Boolean, default: false },
  timestamps: true
}
```

### Note Model

```javascript
{
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: ObjectId, ref: "User", required: true },
  session: { type: String, required: true },
  course: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  subject: { type: String, required: true },
  timestamps: true
}
```

### Feedback Model

```javascript
{
  user: { type: ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  timestamps: true
}
```

### Contact Model

```javascript
{
  user: { type: ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true }
}
```

## Middleware

### Authentication Middleware

1. **authenticateUser**
   - Extracts JWT token from the Authorization header
   - Verifies token signature and validity
   - Attaches decoded user data to the request object
   - Rejects requests with invalid or missing tokens

2. **authorizeAdmin**
   - Checks if the authenticated user has the "admin" role
   - Allows access to admin-only routes for authorized users
   - Returns 403 Forbidden error for non-admin users

### File Upload Middleware

1. **Upload Middleware (Notes)**
   - Configures Multer for file uploads
   - Integrates with Cloudinary for cloud storage
   - Validates file types (PDF, DOC, DOCX)
   - Limits file size to protect server resources
   - Generates unique filenames to prevent conflicts

2. **Profile Picture Upload Middleware**
   - Configures Multer for image uploads
   - Integrates with Cloudinary for cloud storage
   - Validates image types (JPEG, PNG)
   - Optimizes image storage for profile pictures

## Error Handling

The server implements consistent error handling patterns:

- Specific error messages for client errors (400-level)
- Generic server error messages for internal errors (500-level)
- Try-catch blocks in async controller functions
- Proper HTTP status codes based on error type
- Descriptive error messages for debugging

## File Upload Functionality

Notes and profile pictures are uploaded using:

1. **Multer**: Handling multipart/form-data and temporary storage
2. **Cloudinary**: Cloud storage service for permanent file hosting
3. **Process**:
   - File uploaded to server via Multer
   - File validated for type and size
   - File uploaded to Cloudinary
   - Cloudinary URL stored in database
   - Original file deleted from server

## Email Verification

The system uses email verification to ensure valid user registrations:

1. **JWT-based tokens** with expiration
2. **EJS templates** for verification emails
3. **Nodemailer** for sending emails
4. **Process**:
   - User registers
   - Verification token generated
   - Email sent with verification link
   - User clicks link to verify
   - Account marked as verified
   - User redirected to success page 