# User Guide: Material and Room Management Web Application

Welcome to the Material and Room Management Web Application! This guide will walk you through all the features and functionalities of the system, helping you efficiently manage your organization's materials, rooms, reservations, and associated files.

## Table of Contents

1.  [Getting Started](#1-getting-started)
    *   [Accessing the Application](#accessing-the-application)
    *   [Login and Registration](#login-and-registration)
2.  [Navigating the Application](#2-navigating-the-application)
3.  [Home Dashboard](#3-home-dashboard)
4.  [Material Management](#4-material-management)
    *   [Material Types Overview (Material Management Page)](#material-types-overview-material-management-page)
    *   [Material Instances (Material Instances Page)](#material-instances-material-instances-page)
    *   [Material Details (Material Details Page)](#material-details-material-details-page)
5.  [Room Management](#5-room-management)
    *   [Rooms Overview (Room Management Page)](#rooms-overview-room-management-page)
    *   [Room Details (Room Details Page)](#room-details-room-details-page)
6.  [Reservations](#6-reservations)
    *   [Reservations List (Reservations Page)](#reservations-list-reservations-page)
    *   [Create New Reservation (Reservation Create Page)](#create-new-reservation-reservation-create-page)
    *   [Reservation Details (Reservation Details Page)](#reservation-details-reservation-details-page)
7.  [File Management](#7-file-management)
    *   [Files List (File Management Page)](#files-list-file-management-page)
    *   [File Details (File Details Page)](#file-details-file-details-page)
8.  [Logging Out](#8-logging-out)

---

## 1. Getting Started

### Accessing the Application

Once the frontend and backend servers are running (as described in the main `README.md`),
open your web browser and navigate to the frontend URL, typically `http://localhost:4200`.

### Login and Registration

Upon accessing the application, you will be directed to the login page.

*   **Login:** If you already have an account, enter your **Username** and **Password** and click the `Login` button.
*   **Register:** If you are a new user, click the `Register` button. You will be prompted to create a new username and password.

[VIDEO: Demonstration of accessing the application, logging in and registering a new user.](./video%20guides/Login.mp4)

## 2. Navigating the Application

The application features a clear header navigation bar at the top of the screen. This bar provides quick access to different sections of the system:

*   **Home:** Returns you to the main dashboard, providing an overview of materials and rooms.
*   **Reservations:** Navigates to the reservation management section.
*   **Files:** Takes you to the file management section.
*   **Manage (Dropdown):** This dropdown menu allows you to access:
    *   **Materials:** For managing material types and adding new material instances.
    *   **Rooms:** For managing room details and adding new rooms.
*   **Logout:** Securely logs you out of the application.

## 3. Home Dashboard

**Page Title:** Home
**Navigation:** Click `Home` in the navigation bar.

The Home dashboard provides a quick summary of your materials and rooms. You can see aggregated information about material types (e.g., total available, total reserved) and a list of rooms with their material counts.

**Interactive Elements:**
*   **Material Type Cards:** Each card represents a material type, showing its total instances, available count, and reserved count. Clicking on a material type card will take you to the **Material Instances Page** for that specific type.
*   **Room List:** Displays a list of rooms with their current material count. Clicking on a room will take you to the **Room Details Page**.

[VIDEO: Overview of the Home Dashboard, highlighting key information displayed and navigation from cards/list.](./video%20guides/Home.mp4)

## 4. Material Management

### Material Types Overview (Material Management Page)

**Page Title:** Material Management
**Navigation:** Click `Manage` > `Materials` in the navigation bar.

This page provides an overview of all material types in the system. You can view existing types, add new material instances, and manage material details.

**Interactive Elements:**
*   **Search Bar:** Search for material types by ID, name, details, or type.
*   **Filter Options:**
    *   **Type:** Filter by specific material types.
    *   **Availability:** Filter by `Available` or `Reserved` status.
    *   **Location:** Filter by the current room location.
*   **Pagination Controls:** Navigate through pages of material types using `Next` and `Previous` buttons.
*   **Material List Table:** Displays material types with their details.
    *   Clicking on a material type in the table will navigate you to the **Material Instances Page** for that type.
*   **Add New Material Form:**
    *   **Type:** Category of the material (e.g., "Laptop", "Projector").
    *   **Name:** Specific name for the material (e.g., "Dell XPS 15", "Epson Projector").
    *   **Current Location:** The room where the material will be located.
    *   **Quantity:** Number of instances to add (e.g., 5 identical laptops).
    *   **Details (Optional):** Additional relevant information.
    *   `Create Material` Button: Adds the new material instance(s) to the system.
*   **Edit Material Form:**
    *   Click the `Edit` button next to a material in the table to populate the form with its details.
    *   Modify fields as needed.
    *   `Update Material` Button: Saves changes to the material.
    *   `Cancel` Button: Discards changes and exits edit mode.
*   `Delete` Button: Deletes the material instance. **Note:** You cannot delete a reserved material.

If an action was ignored, you can read the error message from top screen by scrolling up

[VIDEO: Demonstration of Material Management Page: searching, filtering, adding new materials, editing, and deleting.](./video%20guides/ManageMaterials.mp4)

### Material Instances (Material Instances Page)

**Page Title:** Material Instances (e.g., "Laptop Instances")
**Navigation:** Click on a material type card on the **Home Dashboard** or a material type in the table on the **Material Management Page** (from the "Material List Table").

This page displays all individual instances of a selected material type.

**Interactive Elements:**
*   **Search Bar:** Search for instances by ID, name, or details.
*   **Filter Options:**
    *   **Availability:** Filter by `Available` or `Reserved` status.
    *   **Location:** Filter by the current room location.
*   **Pagination Controls:** Navigate through pages of material instances.
*   **Material Instances Table:** Lists individual material instances summerised by Location and quantity available and reserved.
    *   Clicking on a material instance's ID or name will navigate you to the **Material Details Page** for that specific instance.

### Material Details (Material Details Page)

**Page Title:** Material Details (e.g., "Dell XPS 15 Details")
**Navigation:** Click on a material instance from the **Material Instances Page** or from search results on the **Material Management Page** (from the "Material List Table").

This page provides comprehensive details about a single material instance and allows for various actions.

**Information Displayed:**
*   **Basic Information:** ID, Name, Type (clickable link to Material Instances Page for that type), Details, Status (Available/Reserved), Current Location (clickable link to Room Details Page for that room).
*   **Reserved Details (if applicable):** If the material is reserved, it shows the Reservation ID (clickable link to Reservation Details Page), Description, and End Date.
*   **Material History:** A chronological log of all actions performed on this specific material (e.g., created, moved, reserved, unreserved, updated).

**Interactive Elements:**
*   **Move Material Section:**
    *   `Select New Room` Dropdown: Choose a new room for the material.
    *   `Move Material` Button: Relocates the material to the selected room. **Note:** You cannot move a reserved material.
*   **Reserve Material Section (visible if material is Available):**
    *   **Create New Reservation:**
        *   `New Reservation Description`: Enter a description for the new reservation.
        *   `End Date (Optional)`: Specify an end date.
        *   `Create New Reservation` Button: Creates a new reservation for this material.
    *   **Add to Existing Reservation:**
        *   `Select Reservation` Dropdown: Choose an active reservation to add this material to.
        *   `Add to Selected Reservation` Button: Adds the material to the chosen reservation.
*   **Reserved Details Section (visible if material is Reserved):**
    *   `Exclude from Reservation` Button: Removes this material from its current reservation, making it available again.
*   `Delete Material` Button: Deletes the material instance. **Note:** You cannot delete a reserved material.

[VIDEO: Demonstration of Material Details Page: viewing info, moving material, reserving (new/existing), excluding from reservation, and deleting.](./video%20guides/MaterialDetail.mp4)

## 5. Room Management

### Rooms Overview (Room Management Page)

**Page Title:** Room Management
**Navigation:** Click `Manage` > `Rooms` in the navigation bar.

This page lists all registered rooms in the system.

**Interactive Elements:**
*   **Search Bar:** Search for rooms by ID or name.
*   **Filter by Capacity:** Filter rooms by a minimum capacity.
*   **Room List:** Displays rooms with their details, including the count of materials currently in each room.
*   **Add New Room Form:**
    *   `Name`: Enter the name of the room (e.g., "Conference Room A").
    *   `Capacity`: Enter the maximum capacity of the room (e.g., 10 for people, or a numerical value for storage).
    *   `Create Room` Button: Adds the new room to the system.

[VIDEO: Demonstration of Room Management Page: searching, filtering, and adding new rooms.](./video%20guides/RoomManagement.mp4)

### Room Details (Room Details Page)

**Page Title:** Room Details (e.g., "Conference Room A Details")
**Navigation:** Click on a room from the **Rooms Overview Page** or from the **Home Dashboard** (from the "Room List").

This page provides comprehensive details about a single room and allows for various actions.

**Information Displayed:**
*   **Basic Information:** ID, Name, Material Count, Maximum Capacity.
*   **Materials in this room:** A list of material types present in the room. You can expand each type to see individual instances, their names, IDs, and availability status.
*   **Room History:** A chronological log of actions related to the room (e.g., created, updated, materials moved in/out).

**Interactive Elements:**
*   `Show Move Materials` / `Hide Move Materials` Button: Toggles the visibility of the "Move Materials" form.
*   **Move Materials Form (hidden by default):**
    *   `Material Type` Dropdown: Select the type of material to move.
    *   `Quantity`: Specify how many instances of that material type to move.
    *   `To Room` Dropdown: Select the destination room.
    *   `Move` Button: Moves the specified quantity of materials from this room to the selected destination.
*   `Delete Room` Button: Deletes the room. **Note:** You cannot delete a room that contains materials.
*   `Update Room ID` Button: Allows changing the room's unique ID.
    *   `New ID` Field: Enter the new ID for the room.
    *   `Update` Button: Applies the new ID. All materials currently in this room will automatically be updated to reflect the new room ID.

[VIDEO: Demonstration of Room Details Page: viewing info, expanding material list, moving materials, deleting room, and updating room ID.](./video%20guides/RoomDetails.mp4)

## 6. Reservations

### Reservations List (Reservations Page)

**Page Title:** Reservations
**Navigation:** Click `Reservations` in the navigation bar.

This page displays a list of all material reservations in the system.

**Interactive Elements:**
*   **Search Bar:** Search for reservations by description or ID.
*   **Filter Options:**
    *   **Status:** Filter by `Active`, `Ended`, or `Cancelled` status.
    *   **Start Date / End Date:** Filter reservations within a specific date range.
*   **Reservation List Table:** Displays reservations with their details.
    *   Clicking on a reservation's ID or description will navigate you to the **Reservation Details Page**.
*   `Create New Reservation` Button: Navigates to the **Create New Reservation Page**.
*   *   If a reservation reached end date or cancelled, **Materials concerned will automatically be free (reserved -> available)**

[VIDEO: Demonstration of Reservations List Page: searching and filtering.](./video%20guides/ReservationHistory.mp4)

### Create New Reservation (Reservation Create Page)

**Page Title:** Create New Reservation
**Navigation:** Click `Create New Reservation` button on the **Reservations List Page**.

This page allows you to create a new material reservation.

**Interactive Elements:**
*   `Description`: A brief description of the reservation (e.g., "Project X Meeting").
*   `Start Date (Optional)`: The start date of the reservation. Defaults to today.
*   `End Date (Optional)`: The expected end date of the reservation.
*   **Add Materials Section:**
    *   **By Specific ID:**
        *   `Material ID` Field: Enter the ID of an individual material instance.
        *   `Add Material by ID` Button: Adds the specified material to the reservation.
    *   **By Type and Location:**
        *   `Material Type` Dropdown: Select a material type.
        *   `Quantity`: Specify the number of instances to reserve.
        *   `From Room` Dropdown: Choose the room from which to reserve them.
        *   `Add Materials by Type` Button: The system will automatically reserve available instances of the specified type from the chosen room.
*   `Create Reservation` Button: Finalizes and creates the reservation.

[VIDEO: Demonstration of Create New Reservation Page: filling out form, adding materials by ID and by type/location.](./video%20guides/ReservationCreation.mp4)

### Reservation Details (Reservation Details Page)

**Page Title:** Reservation Details (e.g., "Project X Meeting Reservation")
**Navigation:** Click on a reservation from the **Reservations List Page**.

This page provides comprehensive details about a single reservation and allows for various management actions.

**Information Displayed:**
*   **Basic Information:** ID, Description, Start Date, End Date, Status.

*   **Materials in Reservation:** A list of all materials included in this reservation.

**Interactive Elements:**
*   `Cancel Reservation` Button: Cancels the reservation. All reserved materials are released. The reservation status changes to `cancelled`.
*   `End Reservation` Button: Manually ends the reservation. All reserved materials are released. The reservation status changes to `ended`.
*   **Add Materials Section:**
    *   `Material ID` Field: Enter the ID of an individual material instance to add.
    *   `Add Material by ID` Button: Adds the specified material to this reservation.
    *   `Material Type` Dropdown: Select a material type.
    *   `Quantity`: Specify the number of instances to add.
    *   `From Room` Dropdown: Choose the room from which to add them.
    *   `Add Materials by Type` Button: Adds available instances of the specified type from the chosen room to this reservation.
*   **Remove Material Button:** Located next to each material in the "Materials in Reservation" list. Removes that specific material from the reservation. If it's the last material, the reservation is cancelled.

[VIDEO: Demonstration of Reservation Details Page: viewing info, cancelling, ending, adding materials, and removing materials.](./video%20guides/ReservationDetails.mp4)

## 7. File Management

### Files List (File Management Page)

**Page Title:** File Management
**Navigation:** Click `Files` in the navigation bar.

This page displays a list of all uploaded files and allows for new file uploads.

**Interactive Elements:**
*   **Search Bar:** Search for files by title or ID.
*   `Upload New File` / `Hide Upload` Button: Toggles the visibility of the file upload form.
*   **Upload New File Form (hidden by default):**
    *   `Choose File` Button: Select a file from your computer.
    *   `Title`: Enter a title for the file.
    *   `Description (Optional)`: Add a description.
    *   `Upload File` Button: Uploads the file to the system.
*   **Files List Table:** Displays uploaded files with their details.
    *   Clicking on a file's ID or title will navigate you to the **File Details Page**.

[VIDEO: Demonstration of Files List Page: searching, toggling upload form, and uploading a new file.](./video%20guides/FileList.mp4)

### File Details (File Details Page)

**Page Title:** File Details (e.g., "Project Plan Details")
**Navigation:** Click on a file from the **Files List Page**.

This page provides comprehensive details about a single uploaded file.

**Information Displayed:**
*   **Basic Information:** ID, Title, Original Name, MIME Type, Size, Uploaded At.
*   **Description:** The description provided during upload.
*   **History:** A log of actions performed on the file (e.g., uploaded).

**Interactive Elements:**
*   `Download File` Button: Downloads the original file to your computer.
*   `Delete File` Button: Deletes the file and its metadata from the system.

[VIDEO: Demonstration of File Details Page: viewing info, downloading, and deleting.](./video%20guides/FileDetails.mp4)

## 8. Logging Out

**Navigation:** Click `Logout` in the top right corner of the navigation bar.

Clicking the `Logout` button will securely log you out of the application and redirect you to the login page.

---