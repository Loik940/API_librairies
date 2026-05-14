# Library Management API

Node.js + Express + MongoDB API for user authentication and book management with owner/admin permissions.

## Project goals

- Create users with secure passwords.
- Authenticate users with JWT.
- Provide public read access to books.
- Restrict create/update/delete actions with role and ownership checks.
- Return clean JSON responses only.

## Tech stack

- Node.js
- Express
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- express-validator
- dotenv

## Project structure

```text
mon-premier-serveur/
  .env
  .gitignore
  package.json
  package-lock.json
  README.md
  server.js
  src/
    config/
      db.js
    controllers/
      authController.js
      bookController.js
    middlewares/
      authMiddleware.js
      errorMiddleware.js
    models/
      User.js
      Book.js
    routes/
      authRoutes.js
      bookRoutes.js
    validators/
      authValidators.js
      bookValidators.js
```

## Installation

```bash
npm install
```

Create a `.env` file at the project root:

```env
PORT=3050
MONGODB_URI=mongodb://127.0.0.1:27017/leclerc_library
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d
```

## Run the API

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Expected startup logs:

```text
MongoDB connected
Server started on http://localhost:3050
```

Note:
- `dotenv` is configured with `quiet: true` in `server.js` to avoid noisy startup messages.

## Response format

Standard success response example:

```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "book": {
      "_id": "BOOK_ID",
      "title": "Clean Code"
    }
  }
}
```

Standard error response example:

```json
{
  "success": false,
  "message": "Server error"
}
```

Validation error response example:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": [
    {
      "type": "field",
      "value": "bad-email",
      "msg": "Please provide a valid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```
## HTTP status codes used

- `200` request successful
- `201` resource created
- `400` bad request or validation error
- `401` unauthenticated or invalid token
- `403` forbidden action
- `404` resource or route not found
- `409` conflict (duplicate unique field)
- `500` internal server error

## API routes

Base URL:

```text
http://localhost:3050
```

### Health route

`GET /`

Expected success response (`200`):

```json
{
  "success": true,
  "message": "Server is running"
}
```

### Auth routes

#### Register

`POST /api/auth/register`

Body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test12345"
}
```

Expected success response (`201`):

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": "USER_ID",
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    }
  }
}
```

Expected error responses:

- `400` validation error

```json
{
  "success": false,
  "message": "Validation failed",
  "data": []
}
```

- `409` duplicate email

```json
{
  "success": false,
  "message": "Unable to create account"
}
```

- `500` server error

```json
{
  "success": false,
  "message": "Server error"
}
```

#### Login

`POST /api/auth/login`

Body:

```json
{
  "email": "test@example.com",
  "password": "test12345"
}
```

Expected success response (`200`):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": "USER_ID",
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    }
  }
}
```

Expected error responses:

- `400` validation error

```json
{
  "success": false,
  "message": "Validation failed",
  "data": []
}
```

- `401` invalid credentials

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

- `500` server error

```json
{
  "success": false,
  "message": "Server error"
}
```

#### Current user

`GET /api/auth/me`

Headers:

```text
Authorization: Bearer JWT_TOKEN
```

Expected success response (`200`):

```json
{
  "success": true,
  "message": "Current user",
  "data": {
    "user": {
      "id": "USER_ID",
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    }
  }
}
```

Expected error responses:

- `401` missing token

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

- `401` invalid token

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

- `404` user not found

```json
{
  "success": false,
  "message": "User not found"
}
```

### Book routes

#### Get all books (public)

`GET /api/books`

Expected success response (`200`):

```json
{
  "success": true,
  "message": "Books fetched successfully",
  "data": {
    "books": []
  }
}
```

Expected error response:

- `500`

```json
{
  "success": false,
  "message": "Server error"
}
```

#### Get one book by id (public)

`GET /api/books/:id`

Expected success response (`200`):

```json
{
  "success": true,
  "message": "Book fetched successfully",
  "data": {
    "book": {
      "_id": "BOOK_ID",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "9780132350884",
      "description": "Software craftsmanship basics.",
      "owner": {
        "_id": "USER_ID",
        "name": "Test User",
        "email": "test@example.com",
        "role": "user"
      },
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "__v": 0
    }
  }
}
```

Expected error responses:

- `400` invalid id

```json
{
  "success": false,
  "message": "Invalid identifier"
}
```

- `404` not found

```json
{
  "success": false,
  "message": "Book not found"
}
```

#### Create a book (protected)

`POST /api/books`

Headers:

```text
Authorization: Bearer JWT_TOKEN
```

Body:

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "description": "Software craftsmanship basics."
}
```

Expected success response (`201`):

```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "book": {
      "_id": "BOOK_ID",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "9780132350884",
      "description": "Software craftsmanship basics.",
      "owner": "USER_ID",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "__v": 0
    }
  }
}
```

Expected error responses:

- `400` validation error

```json
{
  "success": false,
  "message": "Validation failed",
  "data": []
}
```

- `401` missing token

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

- `409` duplicate ISBN

```json
{
  "success": false,
  "message": "ISBN already in use"
}
```

#### Update a book (protected)

`PUT /api/books/:id`

Headers:

```text
Authorization: Bearer JWT_TOKEN
```

Body:

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "description": "Updated description"
}
```

Expected success response (`200`):

```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "book": {}
  }
}
```

Expected error responses:

- `400` invalid id or validation failure

```json
{
  "success": false,
  "message": "Invalid identifier"
}
```

or

```json
{
  "success": false,
  "message": "Validation failed",
  "data": []
}
```

- `401` missing or invalid token

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

or

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

- `403` not owner and not admin

```json
{
  "success": false,
  "message": "Action forbidden"
}
```

- `404` book not found

```json
{
  "success": false,
  "message": "Book not found"
}
```

- `409` duplicate ISBN

```json
{
  "success": false,
  "message": "ISBN already in use"
}
```

#### Delete a book (protected)

`DELETE /api/books/:id`

Headers:

```text
Authorization: Bearer JWT_TOKEN
```

Expected success response (`200`):

```json
{
  "success": true,
  "message": "Book deleted successfully",
  "data": {
    "book": {}
  }
}
```

Expected error responses:

- `400` invalid id

```json
{
  "success": false,
  "message": "Invalid identifier"
}
```

- `401` missing or invalid token

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

or

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

- `403` not owner and not admin

```json
{
  "success": false,
  "message": "Action forbidden"
}
```

- `404` book not found

```json
{
  "success": false,
  "message": "Book not found"
}
```

### Unknown route

`GET /api/unknown`

Expected error response (`404`):

```json
{
  "success": false,
  "message": "Route not found"
}
```

## Quick test flow

1. Register a user.
2. Login and copy the token.
3. Call `GET /api/auth/me` with `Bearer` token.
4. Create a book with token.
5. Update and delete the book with the same user.
6. Create a second user and verify `403` on update/delete.

## Reset local database

Delete the whole database:

```powershell
node -e "require('dotenv').config({ path: '.env', quiet: true }); const mongoose = require('mongoose'); (async () => { await mongoose.connect(process.env.MONGODB_URI); await mongoose.connection.db.dropDatabase(); console.log('Database cleared'); await mongoose.disconnect(); })().catch(err => { console.error(err); process.exit(1); });"
```

Delete only `users` and `books` collections:

```powershell
node -e "require('dotenv').config({ path: '.env', quiet: true }); const mongoose = require('mongoose'); (async () => { await mongoose.connect(process.env.MONGODB_URI); await mongoose.connection.collection('users').deleteMany({}); await mongoose.connection.collection('books').deleteMany({}); console.log('Users and books collections cleared'); await mongoose.disconnect(); })().catch(err => { console.error(err); process.exit(1); });"
```

## Security notes

- Password is hashed with bcrypt.
- Password is never returned in API responses.
- Protected routes require `Authorization: Bearer <token>`.
- `owner` stores the user id that created the book.
- Admin can perform delete operations even when not owner.


