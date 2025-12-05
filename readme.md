# Course Master API Documentation

A comprehensive Learning Management System (LMS) backend built with Node.js, Express, TypeScript, MongoDB, and Redis.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Auth Routes](#auth-routes)
  - [Course Routes](#course-routes)
  - [Student Routes](#student-routes)
  - [Admin Routes](#admin-routes)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- MongoDB
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp env.example .env

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/coursemaster
BCRYPT_SALT_ROUNDS=10
ALLOWED_ORIGINS=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=365d

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Admin Registration
ADMIN_REGISTRATION_KEY=your_admin_key

# Email Configuration (optional)
EMAIL_USER=your_email@gmail.com
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

---

## Authentication

All protected routes require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

- **student**: Regular users who can enroll in courses
- **admin**: Full access to create/manage courses and view analytics

---

## API Endpoints

### Base URL

```
http://localhost:5000/api/v1
```

### Health Check

```http
GET /health
```

Response:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-05T10:30:00.000Z"
}
```

---

## Auth Routes

### Register User

```http
POST /api/v1/auth/register
```

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "registrationKey": "admin_key_optional"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successfully",
  "statusCode": 201,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Notes:**

- If `registrationKey` matches `ADMIN_REGISTRATION_KEY`, user becomes admin
- Password must be 6-16 characters
- Rate limited: 5 requests per 15 minutes

---

### Login

```http
POST /api/v1/auth/login
```

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "login successfully",
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Rate Limited:** 5 requests per 15 minutes

---

### Refresh Token

```http
POST /api/v1/auth/refresh-token
```

**Cookies:**

- `refreshToken`: Required

**Response:**

```json
{
  "success": true,
  "message": "login successfully",
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Logout

```http
POST /api/v1/auth/logout
```

**Authorization:** Required (Student or Admin)

**Response:**

```json
{
  "success": true,
  "message": "Logout successful",
  "statusCode": 200
}
```

---

### Get Current User

```http
GET /api/v1/auth/me
```

**Authorization:** Required (Student or Admin)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

## Course Routes

### Get All Courses

```http
GET /api/v1/course
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Text search in title/description
- `category` (string): Filter by category
- `tags` (string): Comma-separated tags
- `sortBy` (string): Sort field (default: createdAt)
- `order` (string): asc or desc (default: desc)
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter

**Example:**

```http
GET /api/v1/course?page=1&limit=10&category=Web Development&minPrice=0&maxPrice=100
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "courses": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Complete Web Development Bootcamp",
        "description": "Learn full-stack web development from scratch",
        "instructor": "Jane Smith",
        "category": "Web Development",
        "tags": ["HTML", "CSS", "JavaScript", "React"],
        "price": 49.99,
        "thumbnail": "https://example.com/thumb.jpg",
        "modules": [],
        "batch": {
          "number": 1,
          "startDate": "2024-01-15T00:00:00.000Z"
        },
        "totalEnrollments": 150,
        "isPublished": true,
        "totalLessons": 50,
        "totalDuration": 3000,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCourses": 48,
      "hasNext": true,
      "hasPrev": false
    },
    "cached": false
  }
}
```

**Rate Limited:** 60 requests per minute

---

### Get Course by ID

```http
GET /api/v1/course/:id
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete Web Development Bootcamp",
    "description": "Learn full-stack web development from scratch",
    "instructor": "Jane Smith",
    "category": "Web Development",
    "tags": ["HTML", "CSS", "JavaScript", "React"],
    "price": 49.99,
    "thumbnail": "https://example.com/thumb.jpg",
    "modules": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Introduction to HTML",
        "description": "Learn HTML basics",
        "order": 1,
        "lessons": [
          {
            "_id": "507f1f77bcf86cd799439013",
            "title": "HTML Basics",
            "videoUrl": "https://example.com/video1.mp4",
            "duration": 30,
            "order": 1
          }
        ]
      }
    ],
    "batch": {
      "number": 1,
      "startDate": "2024-01-15T00:00:00.000Z"
    },
    "totalEnrollments": 150,
    "isPublished": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Student Routes

**All student routes require authentication with student role.**

### Get Student Dashboard

```http
GET /api/v1/students/dashboard
```

**Authorization:** Required (Student)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "enrollments": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "user": "507f1f77bcf86cd799439011",
        "course": {
          "_id": "507f1f77bcf86cd799439012",
          "title": "Web Development Bootcamp",
          "thumbnail": "https://example.com/thumb.jpg",
          "instructor": "Jane Smith",
          "category": "Web Development",
          "totalDuration": 3000
        },
        "progress": 35,
        "completedLessons": [],
        "enrolledAt": "2024-01-10T00:00:00.000Z",
        "lastAccessedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "totalCourses": 3
  }
}
```

---

### Enroll in Course

```http
POST /api/v1/students/enroll/:courseId
```

**Authorization:** Required (Student)

**Response:**

```json
{
  "success": true,
  "message": "Enrolled successfully",
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "user": "507f1f77bcf86cd799439011",
    "course": "507f1f77bcf86cd799439012",
    "progress": 0,
    "completedLessons": [],
    "enrolledAt": "2024-01-10T00:00:00.000Z",
    "lastAccessedAt": "2024-01-10T00:00:00.000Z"
  }
}
```

---

### Get Enrollment Details

```http
GET /api/v1/students/enrollments/:enrollmentId
```

**Authorization:** Required (Student)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "user": "507f1f77bcf86cd799439011",
    "course": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Web Development Bootcamp",
      "modules": [...]
    },
    "progress": 35,
    "completedLessons": [
      {
        "moduleId": "507f1f77bcf86cd799439013",
        "lessonId": "507f1f77bcf86cd799439014",
        "completedAt": "2024-01-12T15:30:00.000Z"
      }
    ],
    "enrolledAt": "2024-01-10T00:00:00.000Z"
  }
}
```

---

### Mark Lesson Complete

```http
POST /api/v1/students/progress
```

**Authorization:** Required (Student)

**Body:**

```json
{
  "enrollmentId": "507f1f77bcf86cd799439014",
  "moduleId": "507f1f77bcf86cd799439013",
  "lessonId": "507f1f77bcf86cd799439014"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Lesson marked as completed",
  "statusCode": 200,
  "data": {
    "progress": 40,
    "completedLessons": 20
  }
}
```

---

### Submit Assignment

```http
POST /api/v1/students/assignments/:assignmentId/submit
```

**Authorization:** Required (Student)

**Body:**

```json
{
  "submissionType": "link",
  "content": "https://drive.google.com/file/d/xyz123/view"
}
```

**Validation:**

- `submissionType`: Must be "link" or "text"
- `content`: Required, max 5000 characters
- For "link" type: Must be valid URL from approved domains (Google Drive, Dropbox, GitHub, GitLab, Bitbucket, OneDrive)

**Response:**

```json
{
  "success": true,
  "message": "Assignment submitted successfully",
  "statusCode": 200,
  "data": {
    "message": "Assignment submitted successfully"
  }
}
```

---

### Submit Quiz

```http
POST /api/v1/students/quizzes/:quizId/submit
```

**Authorization:** Required (Student)

**Body:**

```json
{
  "answers": [0, 2, 1, 3, 0]
}
```

**Notes:**

- `answers`: Array of answer indices (0-3)
- Array length must match number of questions

**Response:**

```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "statusCode": 200,
  "data": {
    "score": 80,
    "correctAnswers": 4,
    "totalQuestions": 5
  }
}
```

---

## Admin Routes

**All admin routes require authentication with admin role.**

### Create Course

```http
POST /api/v1/admin/courses
```

**Authorization:** Required (Admin)

**Body:**

```json
{
  "title": "Advanced React Development",
  "description": "Master React with hooks, context, and advanced patterns",
  "instructor": "John Smith",
  "category": "Web Development",
  "tags": ["React", "JavaScript", "Frontend"],
  "price": 79.99,
  "thumbnail": "https://example.com/thumb.jpg",
  "modules": [
    {
      "title": "React Fundamentals",
      "description": "Learn the basics",
      "order": 1,
      "lessons": [
        {
          "title": "Introduction to React",
          "videoUrl": "https://example.com/video1.mp4",
          "duration": 45,
          "order": 1
        }
      ]
    }
  ]
}
```

**Validation:**

- `title`: 3-100 characters
- `description`: 10-2000 characters
- `category`: Must be one of: "Web Development", "Mobile Development", "Data Science", "AI/ML", "DevOps", "Other"
- `price`: Minimum 0

**Response:**

```json
{
  "success": true,
  "message": "Course created successfully",
  "statusCode": 201,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "title": "Advanced React Development",
    "description": "Master React with hooks, context, and advanced patterns",
    "instructor": "John Smith",
    "category": "Web Development",
    "tags": ["React", "JavaScript", "Frontend"],
    "price": 79.99,
    "modules": [...],
    "createdAt": "2024-01-20T00:00:00.000Z"
  }
}
```

---

### Update Course

```http
PUT /api/v1/admin/courses/:id
```

**Authorization:** Required (Admin)

**Body:** (Same as Create Course, all fields optional)

**Response:**

```json
{
  "success": true,
  "message": "Course updated successfully",
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "title": "Advanced React Development - Updated",
    ...
  }
}
```

---

### Delete Course

```http
DELETE /api/v1/admin/courses/:id
```

**Authorization:** Required (Admin)

**Response:**

```json
{
  "success": true,
  "message": "Course deleted successfully",
  "statusCode": 200,
  "data": {
    "message": "Course deleted successfully"
  }
}
```

---

### Get Course Enrollments

```http
GET /api/v1/admin/courses/:courseId/enrollments
```

**Authorization:** Required (Admin)

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "enrollments": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "user": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "course": "507f1f77bcf86cd799439012",
        "progress": 35,
        "enrolledAt": "2024-01-10T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalEnrollments": 55
    }
  }
}
```

---

### Module Management

#### Add Module

```http
POST /api/v1/admin/courses/:courseId/modules
```

**Authorization:** Required (Admin)

**Body:**

```json
{
  "title": "Advanced JavaScript Concepts",
  "description": "Deep dive into JS",
  "order": 3
}
```

**Response:**

```json
{
  "success": true,
  "message": "Module added successfully",
  "statusCode": 201,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "modules": [...]
  }
}
```

---

#### Update Module

```http
PUT /api/v1/admin/courses/:courseId/modules/:moduleId
```

**Authorization:** Required (Admin)

**Body:**

```json
{
  "title": "Advanced JavaScript - Updated",
  "description": "Updated description",
  "order": 2
}
```

---

#### Delete Module

```http
DELETE /api/v1/admin/courses/:courseId/modules/:moduleId
```

**Authorization:** Required (Admin)

**Response:**

```json
{
  "success": true,
  "message": "Module deleted successfully",
  "statusCode": 200,
  "data": {...}
}
```

---

#### Reorder Modules

```http
PUT /api/v1/admin/courses/:courseId/modules/reorder
```

**Authorization:** Required (Admin)

**Body:**

```json
{
  "moduleOrders": [
    { "moduleId": "507f1f77bcf86cd799439013", "order": 1 },
    { "moduleId": "507f1f77bcf86cd799439014", "order": 2 },
    { "moduleId": "507f1f77bcf86cd799439015", "order": 3 }
  ]
}
```

---

### Lesson Management

#### Add Lesson

```http
POST /api/v1/admin/courses/:courseId/modules/:moduleId/lessons
```

**Authorization:** Required (Admin)

**Body:**

```json
{
  "title": "React Hooks Deep Dive",
  "videoUrl": "https://example.com/video5.mp4",
  "duration": 60,
  "order": 1
}
```

**Validation:**

- `title`: 1-200 characters
- `videoUrl`: Valid URL
- `duration`: 1-600 minutes

---

#### Update Lesson

```http
PUT /api/v1/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId
```

**Authorization:** Required (Admin)

**Body:** (Same as Add Lesson, all fields optional)

---

#### Delete Lesson

```http
DELETE /api/v1/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId
```

**Authorization:** Required (Admin)

---

#### Reorder Lessons

```http
PUT /api/v1/admin/courses/:courseId/modules/:moduleId/lessons/reorder
```

**Authorization:** Required (Admin)

**Body:**

```json
{
  "lessonOrders": [
    { "lessonId": "507f1f77bcf86cd799439016", "order": 1 },
    { "lessonId": "507f1f77bcf86cd799439017", "order": 2 }
  ]
}
```

---

### Assignment Management

#### Create Assignment

```http
POST /api/v1/admin/assignments
```

**Authorization:** Required (Admin)

**Body:**

```json
{
  "course": "507f1f77bcf86cd799439015",
  "module": "507f1f77bcf86cd799439016",
  "title": "Build a React App",
  "description": "Create a todo app using React hooks and context API"
}
```

**Validation:**

- `title`: 3-200 characters
- `description`: 10-2000 characters

**Response:**

```json
{
  "success": true,
  "message": "Assignment created successfully",
  "statusCode": 201,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "course": "507f1f77bcf86cd799439015",
    "module": "507f1f77bcf86cd799439016",
    "title": "Build a React App",
    "description": "Create a todo app using React hooks and context API",
    "submissions": [],
    "createdAt": "2024-01-20T00:00:00.000Z"
  }
}
```

---

#### Get Assignment Submissions

```http
GET /api/v1/admin/assignments/:assignmentId/submissions
```

**Authorization:** Required (Admin)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "assignment": {
      "_id": "507f1f77bcf86cd799439020",
      "title": "Build a React App",
      "description": "Create a todo app...",
      "submissions": [
        {
          "_id": "507f1f77bcf86cd799439021",
          "user": {
            "_id": "507f1f77bcf86cd799439011",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "submissionType": "link",
          "content": "https://github.com/johndoe/react-todo",
          "submittedAt": "2024-01-15T10:30:00.000Z",
          "grade": 85,
          "feedback": "Good work! Consider adding error handling."
        }
      ]
    },
    "totalSubmissions": 25
  }
}
```

---

#### Grade Assignment

```http
PUT /api/v1/admin/assignments/:assignmentId/submissions/:submissionId/grade
```

**Authorization:** Required (Admin)

**Body:**

```json
{
  "grade": 85,
  "feedback": "Excellent work! Well-structured code with good practices."
}
```

**Validation:**

- `grade`: 0-100 (required)
- `feedback`: Max 1000 characters (optional)

**Response:**

```json
{
  "success": true,
  "message": "Assignment graded successfully",
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "grade": 85,
    "feedback": "Excellent work!",
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Quiz Management

#### Create Quiz

```http
POST /api/v1/admin/quizzes
```

**Authorization:** Required (Admin)

**Body:**

```json
{
  "course": "507f1f77bcf86cd799439015",
  "module": "507f1f77bcf86cd799439016",
  "title": "React Hooks Quiz",
  "questions": [
    {
      "question": "What is the purpose of useState?",
      "options": [
        "To add state to functional components",
        "To fetch data from APIs",
        "To handle side effects",
        "To create context"
      ],
      "correctAnswer": 0
    },
    {
      "question": "Which hook is used for side effects?",
      "options": ["useState", "useContext", "useEffect", "useReducer"],
      "correctAnswer": 2
    }
  ]
}
```

**Validation:**

- `title`: 3-200 characters
- `questions`: 1-50 questions
- Each question must have exactly 4 options
- `correctAnswer`: 0-3 (option index)

**Response:**

```json
{
  "success": true,
  "message": "Quiz created successfully",
  "statusCode": 201,
  "data": {
    "_id": "507f1f77bcf86cd799439025",
    "course": "507f1f77bcf86cd799439015",
    "module": "507f1f77bcf86cd799439016",
    "title": "React Hooks Quiz",
    "questions": [...],
    "attempts": [],
    "createdAt": "2024-01-20T00:00:00.000Z"
  }
}
```

---

### Analytics

```http
GET /api/v1/admin/analytics
```

**Authorization:** Required (Admin)

**Query Parameters:**

- `startDate` (string): ISO date string (optional)
- `endDate` (string): ISO date string (optional)

**Example:**

```http
GET /api/v1/admin/analytics?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "overview": {
      "totalCourses": 45,
      "totalEnrollments": 1250,
      "totalStudents": 850
    },
    "enrollmentTrends": [
      {
        "_id": { "year": 2024, "month": 1 },
        "count": 120
      },
      {
        "_id": { "year": 2024, "month": 2 },
        "count": 145
      }
    ],
    "coursesByCategory": [
      {
        "_id": "Web Development",
        "count": 15,
        "avgPrice": 65.5,
        "totalEnrollments": 450
      },
      {
        "_id": "Data Science",
        "count": 10,
        "avgPrice": 89.99,
        "totalEnrollments": 320
      }
    ]
  }
}
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error message",
  "errorMessages": [
    {
      "path": "field_name",
      "message": "Specific error message"
    }
  ],
  "stack": "Error stack trace (only in development)"
}
```

### Common Error Codes

| Status Code | Description                             |
| ----------- | --------------------------------------- |
| 400         | Bad Request - Invalid input data        |
| 401         | Unauthorized - Invalid or missing token |
| 403         | Forbidden - Insufficient permissions    |
| 404         | Not Found - Resource doesn't exist      |
| 409         | Conflict - Resource already exists      |
| 500         | Internal Server Error                   |

### Example Errors

#### Validation Error

```json
{
  "success": false,
  "message": "Validation Error",
  "errorMessages": [
    {
      "path": "email",
      "message": "Please provide a valid email"
    },
    {
      "path": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

#### Authentication Error

```json
{
  "success": false,
  "message": "Unable to process request",
  "errorMessages": [
    {
      "path": "",
      "message": "Unable to process request"
    }
  ]
}
```

#### Not Found Error

```json
{
  "success": false,
  "message": "Course not found",
  "errorMessages": [
    {
      "path": "",
      "message": "Course not found"
    }
  ]
}
```

---

## Rate Limiting

### Auth Routes

- **Limit:** 5 requests per 15 minutes
- **Applies to:** Register, Login
- **Response when exceeded:**

```json
{
  "success": false,
  "message": "login is temporarily restricted"
}
```

### API Routes

- **Limit:** 60 requests per minute
- **Applies to:** Most GET endpoints
- **Response when exceeded:**

```json
{
  "success": false,
  "message": "Too many requests — please wait and try again shortly"
}
```

---

## Features

### Security

- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt
- HTTP-only cookies for refresh tokens
- Helmet.js for security headers
- MongoDB sanitization against NoSQL injection
- Input sanitization (curly braces replaced)
- CORS with configurable origins
- Rate limiting on sensitive endpoints

### Performance

- Redis caching for course listings (5-minute TTL)
- Database indexing on frequently queried fields
- Response compression (gzip)
- Connection pooling for MongoDB
- Pagination support for large datasets

### Data Validation

- Zod schemas for request validation
- Mongoose schema validation
- Email format validation
- URL validation for submissions
- File type restrictions for assignments

---

## Development

### Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:check

# Code formatting
npm run prettier:check
npm run prettier:fix

# Database seeding
npm run seed
```

### Database Indexes

The following indexes are automatically created:

**Courses:**

- Text index on `title` and `description`
- Compound index on `category` and `price`
- Index on `createdAt` (descending)

**Users:**

- Unique index on `email`

**Enrollments:**

- Unique compound index on `user` and `course`

**Assignments:**

- Compound index on `course`

## 📄 License

MIT

## 👨‍💻 Author

**Rasel Hossain**
