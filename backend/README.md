# Backend - Material and Room Management API

This directory contains the backend API for the Material and Room Management web application. It is built with Node.js and Express.js, providing RESTful endpoints for managing materials, rooms, reservations, and files.

## Technologies Used

-   **Node.js**: JavaScript runtime environment.
-   **Express.js**: Web application framework for Node.js.
-   **JSON Web Tokens (JWT)**: For secure user authentication.
-   **bcrypt**: For hashing and salting user passwords.
-   **Multer**: Middleware for handling `multipart/form-data`, primarily used for file uploads.
-   **`fs` (File System) module**: Node.js built-in module for interacting with the file system (reading/writing JSON data files).
-   **Custom File Locking (`file-lock.js`)**: A simple mechanism to prevent race conditions when multiple requests try to write to the same JSON data file simultaneously.

## Project Structure

```
backend/
├── data/                 # Stores application data in JSON files (e.g., users.json, materials.json)
├── middleware/           # Custom Express middleware (e.g., authentication middleware)
├── node_modules/         # Installed Node.js packages
├── routes/               # Defines API endpoints for different resources
│   ├── auth.js           # User authentication (login, logout, register)
│   ├── files.js          # File upload and management
│   ├── materials.js      # Material instance management
│   ├── reservations.js   # Reservation management
│   └── rooms.js          # Room management
├── uploads/              # Directory for storing uploaded files
├── .gitignore            # Specifies intentionally untracked files to ignore
├── file-lock.js          # Custom file locking utility
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Records the exact dependency tree
└── server.js             # Main application entry point
```

## API Endpoints

The API provides the following main endpoints:

-   `/auth`: User authentication (login, logout, register).
-   `/materials`: Manage material instances (CRUD, move, history).
-   `/rooms`: Manage rooms (CRUD, update ID, history).
-   `/reservations`: Manage material reservations (CRUD, add/remove materials, cancel, end).
-   `/files`: Upload and manage files.

**Authentication:** Most endpoints (except `/auth/login` and `/auth/register`) require a valid JWT in the `Authorization` header (e.g., `Bearer <token>`).

## Setup and Running

1.  **Navigate to the `backend` directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the server:**
    ```bash
    node server.js
    ```
    The server will start on `http://localhost:3000` by default.

## Data Storage

Application data is stored in JSON files within the `data/` directory. This setup is suitable for small-scale applications or development environments. For production, a more robust database solution would be recommended.

-   `users.json`: Stores user credentials (hashed passwords).
-   `materials.json`: Stores details about material instances.
-   `rooms.json`: Stores room information.
-   `reservations.json`: Stores reservation details.
-   `files.json`: Stores metadata about uploaded files.

**Security Note:** Passwords in `users.json` are hashed using `bcrypt`. When adding new users manually, ensure their passwords are also hashed.

## File Uploads

Uploaded files are stored in the `uploads/` directory. Metadata about these files is stored in `data/files.json`.

## Error Handling

API endpoints return appropriate HTTP status codes and JSON error messages for invalid requests or server-side issues.
