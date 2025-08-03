# Material and Room Management Web Application

This is a full-stack web application designed to manage materials, rooms, reservations, and files within an organization or facility. It provides a user-friendly interface for tracking assets, booking resources, and managing associated documentation.

## Key Features

### General
- User authentication (login, logout, registration)
- Role-based access control (though roles are not explicitly implemented, the foundation for authenticated access is there)

### Materials Management
- View, add, update, and delete material instances.
- Filter and search materials by type, availability, and location.
- Track material history (creation, updates, moves, reservations).
- Prevent deletion or movement of reserved materials.

### Room Management
- View, add, update, and delete rooms.
- Track materials located in each room.
- Prevent deletion of rooms containing materials.
- View room history (creation, updates, material movements).

### Reservations
- Create, view, cancel, and end reservations for materials.
- Reserve specific material instances or quantities of a material type from a specific room.
- Automatic ending of expired reservations.
- Add/remove materials from existing active reservations.

### File Management
- Upload, view, and download files.
- Delete files and their metadata.
- Search files by title or ID.

## Documentation
For a detailed user guide, refer to the [User Guide](GUIDE.md).

## Technologies Used

**Frontend:**
- Angular (TypeScript)
- Bootstrap (for styling)

**Backend:**
- Node.js with Express.js
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- Multer for handling file uploads
- `fs` module for file system operations
- Custom file-locking mechanism for data consistency

## Setup and Installation

To get this project up and running on your local machine, follow these steps:

### 1. Clone the Repository
```bash
git clone <repository_url>
cd <repository_name>
```

### 2. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```
Install the Node.js dependencies:
```bash
npm install
```

**Important:** The application uses JSON files for data storage. Initial user data is in `backend/data/users.json`. Passwords are hashed using `bcrypt`. If you need to add new users directly to `users.json`, ensure their passwords are hashed. You can use a tool or a small script to generate hashed passwords.

Start the backend server:
```bash
node server.js
```
The backend server will typically run on `http://localhost:3000`.

### 3. Frontend Setup
Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
```
Install the Angular dependencies:
```bash
npm install
```

Start the Angular development server:
```bash
ng serve
```
The frontend application will typically be accessible at `http://localhost:4200`.

## Usage

1.  **Access the Application:** Open your web browser and go to `http://localhost:4200`.
2.  **Login/Register:** Use the login page to authenticate. If you don't have an account, you can register a new one.
3.  **Navigate:** Use the header navigation to access different sections like Home, Reservations, Files, Material Management, and Room Management.
4.  **Manage Data:** Interact with the forms and tables to add, view, update, and delete materials, rooms, reservations, and files.

Enjoy using the application!
