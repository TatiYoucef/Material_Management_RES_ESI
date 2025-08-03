# Frontend - Material and Room Management UI

This directory contains the Angular frontend application for the Material and Room Management system. It provides a single-page application (SPA) interface for users to interact with the backend API.

## Technologies Used

-   **Angular**: A platform and framework for building single-page client applications using HTML and TypeScript.
-   **TypeScript**: A superset of JavaScript that adds static types.
-   **Bootstrap**: A popular CSS framework for developing responsive and mobile-first websites.
-   **RxJS**: Reactive Extensions for JavaScript, used for asynchronous programming with observable collections.
-   **Angular CLI**: Command Line Interface for Angular to automate development tasks.

## Project Structure

```
frontend/
├── src/                      # Source code for the Angular application
│   ├── app/                  # Main application module
│   │   ├── app.component.ts  # Root component
│   │   ├── app.routes.ts     # Defines application routes
│   │   ├── pages/            # Contains feature-specific components (e.g., auth, materials, rooms, reservations, files)
│   │   │   ├── auth/
│   │   │   ├── file-management/
│   │   │   ├── home/
│   │   │   ├── materials/
│   │   │   ├── not-found/
│   │   │   ├── reservations/
│   │   │   └── rooms/
│   │   └── services/         # Angular services for data fetching and business logic
│   │       ├── auth.service.ts
│   │       ├── data.service.ts
│   │       └── file.service.ts
│   ├── assets/               # Static assets (images, etc.)
│   ├── environments/         # Environment-specific configurations
│   ├── favicon.ico           # Application favicon
│   ├── index.html            # Main HTML file
│   ├── main.ts               # Entry point for the Angular application
│   └── styles.scss           # Global styles
├── angular.json              # Angular CLI configuration
├── package.json              # Project metadata and dependencies
├── tsconfig.json             # TypeScript configuration
└── ... (other configuration files)
```

## Features

-   **User Authentication**: Login and logout functionality, with route guards to protect authenticated routes.
-   **Dynamic Navigation**: Responsive header with navigation links to different sections of the application.
-   **Material Management**: Pages to list, view details, add, update, and delete material instances. Includes search and filtering capabilities.
-   **Room Management**: Pages to list, view details, add, update, and delete rooms. Displays materials within each room.
-   **Reservation Management**: Pages to view, create, cancel, and manage material reservations.
-   **File Management**: Pages to upload, list, view details, and download files.
-   **Data Display**: Utilizes tables and forms for clear presentation and interaction with data.
-   **History Tracking**: Displays historical changes for materials and rooms.

## Setup and Running

1.  **Navigate to the `frontend` directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    ng serve
    ```
    The application will be served at `http://localhost:4200`. It will automatically reload if you change any of the source files.

## Development

-   **Code Scaffolding**: Use `ng generate component <component-name>` to generate new components.
-   **Build**: Use `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
-   **Testing**: Use `ng test` to execute the unit tests via Karma. Use `ng e2e` to execute the end-to-end tests via Protractor.

## Styling

This project uses SCSS for styling. Global styles are defined in `src/styles.scss`, and component-specific styles are in their respective `.scss` files.

## Communication with Backend

The frontend communicates with the backend API (running on `http://localhost:3000`) using Angular's `HttpClient` module. An `AuthInterceptor` automatically attaches the JWT to outgoing requests for authentication.