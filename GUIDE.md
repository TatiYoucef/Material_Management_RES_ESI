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
9. [Automated System Processes and Background Features](#9-automated-system-processes-and-background-features)

---

## 1. Getting Started

### Accessing the Application

Once the frontend and backend servers are running (as described in the main `README.md`),
open your web browser and navigate to the frontend URL, typically `http://localhost:4200`.

### Login and Registration

Upon accessing the application, you will be directed to the login page.

*   **Login:** If you already have an account, enter your **Username** and **Password** and click the `Login` button.

[VIDEO: Demonstration of accessing the application, logging in.](https://drive.google.com/file/d/14D_wYDqqoHLW9Xc2EROY2f1k3q-WEPgW/view?usp=sharing)

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

[VIDEO: Overview of the Home Dashboard, highlighting key information displayed and navigation from cards/list.](https://drive.google.com/file/d/1OizcVu_ew4-UsF_CnjG0zZfPf5EElddA/view?usp=sharing)

## 4. Material Management

### Material Management (Material Management Page)

**Page Title:** Material Management
**Navigation:** Click `Manage Materials` in the navigation bar.

This page allows you to add new material instances, manage existing ones (edit, delete), and view a paginated list of all individual material instances in the system.

**Interactive Elements:**
*   **Add/Edit Material Form:**
    *   **ID (for editing):** When editing, the material's unique ID is displayed and can be modified.
    *   **Type:** Select an existing category for the material (e.g., "Laptop", "Projector") or choose "Add New Type" to define a new one.
    *   **New Type Name (if "Add New Type" selected):** Enter the name for a new material category.
    *   **Name:** A specific name for the material instance (e.g., "Dell XPS 15", "Epson Projector").
    *   **Details (Optional):** Additional relevant information about the material.
    *   **Initial Location:** The room where the material will be initially located.
    *   **Quantity (for adding new materials):** Specify the number of identical instances to add. This field is disabled if "Custom IDs" are used.
    *   **Add Custom IDs (for adding new materials):**
        *   Toggle this option to define specific IDs for new material instances instead of using a quantity.
        *   **Enumerated IDs:** Enter a "Start ID" and "End ID" to generate a sequence of IDs (e.g., 101 to 105).
        *   **Comma Separated IDs:** Enter a list of custom IDs separated by commas (e.g., "MTRL-001, MTRL-002, MTRL-005").
        *   `Add Enumerated IDs` / `Add Comma Separated IDs` Buttons: Add the generated/entered IDs to a list.
        *   `Clear All Custom IDs` Button: Removes all custom IDs from the list.
    *   `Add Material` Button: Adds the new material instance(s) to the system.
    *   `Update Material` Button: Saves changes to an existing material.
    *   `Cancel` Button: Discards changes and exits edit mode.
*   **Search Bar:** Search for material instances by ID, name, or details.
*   **Filter Options:**
    *   **Type:** Filter by specific material types.
    *   **Status:** Filter by `Available`, `Reserved`, or `Serving` status.
    *   **Location:** Filter by the current room location.
*   **Pagination Controls:** Navigate through pages of material instances using `Previous` and `Next` buttons.
*   **Material List Display:** Displays individual material instances with their details.
    *   Each item shows Name, ID, Type, Status (Available, Reserved, or Serving), and Location.
    *   `Edit` Button: Populates the form with the material's details for modification.
    *   `Delete` Button: Deletes the material instance. **Note:** You cannot delete a reserved material.

If an action was ignored, you can read the error message from top screen by scrolling up

[VIDEO: Demonstration of Material Management Page: searching, filtering, adding new materials (with and without custom IDs), editing (including ID modification), and deleting.](https://drive.google.com/file/d/1buBhaKZh2Px1ZViOD3p1hJEt-35eJbVt/view?usp=sharing)

### Material Instances (Material Instances Page)

**Page Title:** Material Instances (e.g., "Laptop Instances")
**Navigation:** Click on a material type card on the **Home Dashboard** or a material type in the table on the **Material Management Page** (from the "Material List Table").

This page displays all individual instances of a selected material type, along with summary information.

**Information Displayed:**
*   **Summary:** Provides a quick overview of the total available, serving, and reserved instances for the selected material type.
*   **Summary by Room:** Shows a breakdown of available, serving, and reserved quantities for the material type within each room.

**Interactive Elements:**
*   **Search Bar:** Search for instances by ID, name, or details.
*   **Filter Options:**
    *   **Status:** Filter by `Available`, `Reserved`, or `Serving` status.
    *   **Location:** Filter by the current room location.
*   **Pagination Controls:** Navigate through pages of material instances.
*   **Material Instances List:** Displays individual material instances.
    *   Clicking on a material instance's ID or name will navigate you to the **Material Details Page** for that specific instance.

### Material Details (Material Details Page)

**Page Title:** Material Details (e.g., "Dell XPS 15 Details")
**Navigation:** Click on a material instance from the **Material Instances Page** or from search results on the **Material Management Page** (from the "Material List Table").

This page provides comprehensive details about a single material instance and allows for various actions.

**Information Displayed:**
*   **Basic Information:** ID, Name, Type (clickable link to Material Instances Page for that type), Details, Status (Available/Reserved/Serving), Current Location (clickable link to Room Details Page for that room).
*   **Reserved Details (if applicable):** If the material is reserved, it shows the Reservation ID (clickable link to Reservation Details Page), Description, and End Date.
*   **Material History:** A chronological log of all actions performed on this specific material (e.g., created, moved, reserved, unreserved, updated, serving status changed).

**Interactive Elements:**
*   **Move Material Section:**
    *   `Select New Room` Dropdown: Choose a new room for the material.
    *   `Move Material` Button: Relocates the material to the selected room. **Note:** You cannot move a reserved material.
*   **Toggle Serving Status:**
    *   `Mark as Serving` Button: Changes the material's status to 'Serving'.
    *   `Mark as Available` Button: Changes the material's status to 'Available'.
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

[VIDEO: Demonstration of Material Details Page: viewing info, moving material, reserving (new/existing), excluding from reservation, and deleting.](https://drive.google.com/file/d/1oW_BEVFYc5MeOfjCfHHVoaite3XtsGui/view?usp=sharing)

## 5. Room Management

### Rooms Overview (Room Management Page)

**Page Title:** Room Management
**Navigation:** Click `Manage Rooms` in the navigation bar.

This page lists all registered rooms in the system.

**Interactive Elements:**
*   **Search Bar:** Search for rooms by ID or name.
*   **Filter by Capacity:** Filter rooms by a minimum capacity.
*   **Room List:** Displays rooms with their details, including the count of materials currently in each room.
*   **Add/Edit Room Form:**
    *   **ID (for editing):** When editing, the room's unique ID is displayed and can be modified.
    *   `Name`: Enter the name of the room (e.g., "Conference Room A").
    *   `Capacity`: Enter the maximum capacity of the room (e.g., 10 for people, or a numerical value for storage).
    *   `Create Room` Button: Adds the new room to the system.
    *   `Update Room` Button: Saves changes to an existing room, including its ID if modified.
    *   `Cancel` Button: Discards changes and exits edit mode.

[VIDEO: Demonstration of Room Management Page: searching, filtering, adding new rooms, editing rooms (including ID modification).](https://drive.google.com/file/d/1O1aG-JuUPgzB2ZFo-DyoNRc_RlcL4knR/view?usp=sharing)

### Room Details (Room Details Page)

**Page Title:** Room Details (e.g., "Conference Room A Details")
**Navigation:** Click on a room from the **Rooms Overview Page** or from the **Home Dashboard** (from the "Room List").

This page provides comprehensive details about a single room and allows for various actions.

**Information Displayed:**
*   **Basic Information:** ID, Name, Material Count, Maximum Capacity.
*   **Materials in this room:** A list of material types present in the room. You can expand each type to see individual instances, their names, IDs, and availability status (Available, Reserved, or Serving).
*   **Room History:** A chronological log of actions related to the room (e.g., created, updated, materials moved in/out, materials added).

**Interactive Elements:**
*   `Show Move Materials` / `Hide Move Materials` Button: Toggles the visibility of the "Move Materials" form.
*   **Move Materials Form (hidden by default):**
    *   `Material Type` Dropdown: Select the type of material to move.
    *   `Quantity`: Specify how many instances of that material type to move.
    *   `To Room` Dropdown: Select the destination room.
    *   `Move` Button: Moves the specified quantity of materials from this room to the selected destination.
*   `Delete Room` Button: Deletes the room. **Note:** You cannot delete a room that contains materials.

[VIDEO: Demonstration of Room Details Page: viewing info, expanding material list, moving materials, deleting room, and updating room ID.](https://drive.google.com/file/d/1fXlWIBQzb7CAOoU--P9vlXBMwNyvri90/view?usp=sharing)

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
*   **Reservation List Table:** Displays reservations with their details, including the number of materials. You can expand each reservation to see a summary of material types and then further expand to view individual material instances within that reservation.
    *   Clicking on a reservation's ID or description will navigate you to the **Reservation Details Page**.
*   `Create New Reservation` Button: Navigates to the **Create New Reservation Page**.
*   *   If a reservation reached end date or cancelled, **Materials concerned will automatically be free (reserved -> available)**

[VIDEO: Demonstration of Reservations List Page: searching and filtering.](https://drive.google.com/file/d/133ItGuATvCyCOnPfHeWi3m8k3JfE0Pyj/view?usp=sharing)

### Create New Reservation (Reservation Create Page)

**Page Title:** Create New Reservation
**Navigation:** Click `Create New Reservation` button on the **Reservations List Page**.

This page allows you to create a new material reservation.

**Interactive Elements:**
*   `Description`: A brief description of the reservation (e.g., "Project X Meeting").
*   `Start Date`: The start date of the reservation. Defaults to today.
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

[VIDEO: Demonstration of Create New Reservation Page: filling out form, adding materials by ID and by type/location.](https://drive.google.com/file/d/17ee74tbLIR8SDuXuL7eKGgUQr_cgUwBf/view?usp=sharing)

### Reservation Details (Reservation Details Page)

**Page Title:** Reservation Details (e.g., "Project X Meeting Reservation")
**Navigation:** Click on a reservation from the **Reservations List Page**.

This page provides comprehensive details about a single reservation and allows for various management actions.

**Information Displayed:**
*   **Basic Information:** ID, Description, Start Date, End Date, Status.

*   **Materials in Reservation:** A list of all materials included in this reservation, aggregated by type. You can expand each material type to view individual instances.

**Interactive Elements:**
*   `Update End Date` Button: Allows you to change the end date of an active reservation.
*   `Cancel Reservation` Button: Cancels the reservation. All reserved materials are released. The reservation status changes to `cancelled`.
*   `End Reservation` Button: Manually ends the reservation. All reserved materials are released. The reservation status changes to `ended`.
*   **Add Materials Section:**
    *   `Material ID` Field: Enter the ID of an individual material instance to add.
    *   `Add Material by ID` Button: Adds the specified material to this reservation.
    *   `Material Type` Dropdown: Select a material type.
    *   `Quantity`: Specify the number of instances to add.
    *   `From Room` Dropdown: Choose the room from which to add them.
    *   `Add Materials by Type` Button: Adds available instances of the specified type from the chosen room to this reservation.
*   `Exclude from Reservation` Action: Located next to each material in the "Materials in Reservation" list. Removes that specific material from the reservation. If it's the last material, the reservation is cancelled.
*   `Delete Reservation` Button: Deletes the reservation entirely.

[VIDEO: Demonstration of Reservation Details Page: viewing info, cancelling, ending, adding materials, and removing materials.](https://drive.google.com/file/d/1kA9qKnuAm38UVe18QhwoNitORsC8pFmP/view?usp=sharing)

## 7. File Management

### Files List (File Management Page)

**Page Title:** File Management
**Navigation:** Click `Files` in the navigation bar.

This page displays a list of all uploaded files and allows for new file uploads.

**Interactive Elements:**
*   **Search Bar:** Search for files by title or ID.
*   **Filter Options:**
    *   **Type:** Filter by predefined file types (e.g., "Facture", "Bon de Livraison", "décharge").
    *   **Supplier (Fournisseur):** Filter by the name of the supplier.
    *   **Date Range:** Filter files uploaded within a specific date range (From and To dates).
*   `Upload New File` / `Hide Upload` Button: Toggles the visibility of the file upload form.
*   **Upload New File Form (hidden by default):**
    *   `Choose File` Button: Select a file from your computer.
    *   `Title`: Enter a title for the file.
    *   `Description (Optional)`: Add a description.
    *   `Type`: Select a predefined type for the file.
    *   `Supplier (Optional)`: Enter the name of the supplier associated with the file.
    *   `Upload File` Button: Uploads the file to the system.
*   **Files List Table:** Displays uploaded files with their details.
    *   Clicking on a file's ID or title will navigate you to the **File Details Page**.

[VIDEO: Demonstration of Files List Page: searching, toggling upload form, and uploading a new file.](https://drive.google.com/file/d/1FWIuv534rNYve0MwCheOeGLh2NTtsynV/view?usp=sharing)

### File Details (File Details Page)

**Page Title:** File Details (e.g., "Project Plan Details")
**Navigation:** Click on a file from the **Files List Page**.

This page provides comprehensive details about a single uploaded file.

**Information Displayed:**
*   **Basic Information:** ID, Title, Original Name, MIME Type, Size, Uploaded At, Type, Supplier (Fournisseur).
*   **Description:** The description provided during upload.
*   **History:** A log of actions performed on the file (e.g., uploaded, updated).

**Interactive Elements:**
*   `Download File` Button: Downloads the original file to your computer.
*   `Delete File` Button: Deletes the file and its metadata from the system.

[VIDEO: Demonstration of File Details Page: viewing info, downloading, and deleting.](https://drive.google.com/file/d/1k0g1Q-ooSGMnswlbWr56oYZI4d0R8k2O/view?usp=sharing)

## 8. Logging Out

**Navigation:** Click `Logout` in the top right corner of the navigation bar.

Clicking the `Logout` button will securely log you out of the application and redirect you to the login page.

---

## 9. Automated System Processes and Background Features

Beyond direct user interactions, the system incorporates several automated processes and background features designed to maintain data consistency, provide timely information, and streamline operations:

*   **Automated Reservation Status Updates:**
    *   **Automatic Ending:** Reservations with an `endDate` that has passed are automatically marked as `ended` by a background process.
    *   **Material Release:** When a reservation is automatically ended, manually ended, or cancelled, all associated materials are automatically released and their status is updated to `Available`.

*   **Scheduled Email Notifications:**
    *   The system automatically sends email notifications to users with registered Gmail accounts for reservations that are ending soon. This helps in timely return of reserved items.
    [VIDEO: Demonstration of automated mail system](https://drive.google.com/file/d/1NJXLG-LD5E7fnoDIdQNBbIxjcw7ZUyJY/view?usp=sharing)

*   **Action Result Notifications:**
    *   After performing actions (e.g., adding a material, creating a reservation), the system provides immediate feedback through on-screen notification messages (success, warning, or error) to inform the user about the outcome of their operation.

*   **Automatic Material Serving Status:**
    *   When a material is moved to or from the 'Magazin' room, its `isServing` status is automatically updated. Materials in 'Magazin' are generally considered not 'Serving', while materials in other rooms are.

*   **Dynamic Room Material Count:**
    *   The `Material Count` displayed for each room is automatically calculated and updated based on the materials currently assigned to that room, ensuring an accurate overview without manual intervention.
