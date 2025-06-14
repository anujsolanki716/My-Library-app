# Personal Book Collection Manager

A full-stack web application designed to simulate a basic library management system. It allows users to manage a personal book collection, where administrators can add and update books, and users can borrow or return them. The application tracks book lending and availability status.

## Table of Contents

1.  [Features](#features)
    *   [User Features](#user-features)
    *   [Admin Features](#admin-features)
2.  [Technologies Used](#technologies-used)
    *   [Frontend](#frontend)
    *   [Backend](#backend)
    *   [Database](#database)
3.  [Project Structure](#project-structure)
4.  [Setup and Installation](#setup-and-installation)
    *   [Prerequisites](#prerequisites)
    *   [Backend Setup](#backend-setup)
    *   [Frontend Setup](#frontend-setup)
5.  [Running the Application](#running-the-application)
    *   [Backend](#backend-1)
    *   [Frontend](#frontend-1)
6.  [Special Admin Account](#special-admin-account)
7.  [API Endpoints](#api-endpoints)
8.  [Environment Variables](#environment-variables)
9.  [Future Enhancements](#future-enhancements)

## Features

### User Features

*   **Secure Registration & Login:** Users can create an account and log in securely.
*   **View Book Catalog:** Browse a list of all available books with details like title, author, genre, and availability.
*   **Search & Filter Books:** Search books by title/author and filter by genre.
*   **Borrow Books:** Users can borrow available books. The borrow button is disabled if no copies are available or if the user has already borrowed the book.
*   **Return Books:** Users can return books they have previously borrowed.
*   **View My Borrowed Books:** A dedicated section to see a list of books currently borrowed by the user, along with the borrow date.
*   **User Dashboard:** A personalized dashboard showing quick links and summaries (e.g., number of borrowed books).

### Admin Features

*   **Secure Login:** Admins log in using their credentials.
*   **Admin Dashboard:** An overview of library statistics (total books, total copies, borrowed books, available copies, total users, etc.).
*   **Book Management (CRUD):**
    *   **Add Books:** Add new books with details: title, author, genre, total copies, and an optional cover image URL.
    *   **Update Books:** Modify the details of existing books.
    *   **Delete Books:** Remove books from the library (only if no copies are currently borrowed).
*   **View All Books:** Admins can see a comprehensive list of all books, including total copies, borrowed count, and available copies.
*   **Quick Actions:** Links to quickly add a new book or view all books.

## Technologies Used

### Frontend

*   **React 19:** A JavaScript library for building user interfaces.
*   **TypeScript:** Superset of JavaScript that adds static typing.
*   **React Router v7 (via esm.sh):** For client-side routing.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.

### Backend

*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **Mongoose:** MongoDB object modeling tool for Node.js.

### Database

*   **MongoDB:** NoSQL document database used to store user, book, and borrowing information.

## Project Structure

```
/
├── public/                     # (Not explicitly created but common for static assets)
├── server/                     # Backend Node.js/Express application
│   ├── models/                 # Mongoose models (User.js, Book.js, BorrowedRecord.js)
│   ├── routes/                 # API routes (authRoutes.js, bookRoutes.js, etc.)
│   ├── middleware/             # Custom middleware (authMiddleware.js)
│   ├── .env.example            # Example environment variables for backend
│   ├── package.json            # Backend dependencies and scripts
│   └── server.js               # Backend server entry point
├── src/                        # Frontend React application
│   ├── components/             # Reusable UI components
│   │   ├── Books/              # Book-specific components (BookCard.tsx, BookForm.tsx)
│   │   ├── Common/             # General components (Button.tsx, Input.tsx, Modal.tsx)
│   │   └── Layout/             # Layout components (Navbar.tsx, Footer.tsx)
│   ├── contexts/               # React contexts (AuthContext.tsx, BookContext.tsx)
│   ├── pages/                  # Page components for different routes
│   │   ├── Admin/
│   │   ├── Auth/
│   │   └── User/
│   ├── App.tsx                 # Main application component with routing setup
│   ├── constants.ts            # Application constants (e.g., API base URL)
│   ├── index.tsx               # Frontend entry point
│   └── types.ts                # TypeScript type definitions
├── .gitignore                  # Specifies intentionally untracked files
├── index.html                  # Main HTML file for the frontend
├── metadata.json               # Application metadata
├── package.json                # (Assuming a root package.json for frontend dev server)
└── README.md                   # This file
```

## Setup and Installation

### Prerequisites

*   **Node.js and npm:** (Node.js >= 16.x recommended) - Download from [nodejs.org](https://nodejs.org/)
*   **MongoDB:** A running MongoDB instance (local or cloud-hosted like MongoDB Atlas). Get it from [mongodb.com](https://www.mongodb.com/try/download/community)

### Backend Setup

1.  **Navigate to the `server` directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create an environment file:**
    Copy `server/.env.example` to `server/.env` and fill in your details:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_very_strong_jwt_secret
    PORT=5001 # Or any port you prefer for the backend
    ```
    *   Replace `your_mongodb_connection_string` with your actual MongoDB connection URI.
    *   Replace `your_very_strong_jwt_secret` with a long, random, and secret string.

4.  **Start server:**
    ```bash
    node server.js
    ```

### Frontend Setup

The frontend is set up to run directly from `index.html` using ES modules and a simple HTTP server. If you are using a development server like `live-server` or Vite for a better development experience:

1.  **Navigate to the project root directory** (the one containing `index.html`).
2.  If you have a root `package.json` for frontend development tools (e.g., for `live-server` or a bundler):
    ```bash
    npm install # If you have dev dependencies like live-server
    ```

3.  **Start app:**
    ```bash
    npm run dev

## Running the Application

### Backend

1.  **Navigate to the `server` directory:**
    ```bash
    cd server
    ```
2.  **Start the backend server:**
    *   For production: `node server.js`
    *   For development (with nodemon, auto-restarts on file changes): `node server.js`

    The backend server will typically run on `http://localhost:5001` (or the `PORT` specified in your `.env` file).

### Frontend

1.  **Open `index.html` in your browser:**
    *   You can directly open the `index.html` file in your web browser.
    *   For a better experience with live reloading (and to avoid potential CORS issues if serving from `file:///`), use a simple HTTP server:
        *   If you have `vite-server` installed globally or as a dev dependency:
            ```bash
            npm run dev . # Run from the project root directory
            ```

    The frontend will try to connect to the backend API at `http://localhost:5001/api` (as defined in `src/constants.ts`). Ensure this matches your backend's running port.

## Special Admin Account

For initial setup or testing, a specific admin account can be created upon registration:

If this is the *very first user* to register in an empty database, they will also be assigned the `ADMIN` role. Subsequent non-special registrations default to `USER`.

## API Endpoints

The backend exposes the following main API endpoints (base path: `/api`):

*   **Authentication (`/auth`):**
    *   `POST /register`: Register a new user.
    *   `POST /login`: Log in an existing user.
    *   `GET /me`: Get the current authenticated user's profile.
*   **Books (`/books`):**
    *   `GET /`: Fetch all books (public).
    *   `GET /:id`: Fetch a single book by ID (public).
    *   `POST /`: Add a new book (Admin only).
    *   `PUT /:id`: Update a book (Admin only).
    *   `DELETE /:id`: Delete a book (Admin only).
    *   `POST /:bookId/borrow`: Borrow a book (User).
    *   `POST /:bookId/return`: Return a book (User).
*   **Users (`/users`):**
    *   `GET /me/borrowed-books`: Get books currently borrowed by the logged-in user (User).
*   **Admin (`/admin`):**
    *   `GET /stats`: Get library statistics (Admin only).

## Environment Variables

### Backend (`server/.env`)

*   `MONGO_URI`: Your MongoDB connection string.
*   `JWT_SECRET`: A secret key for signing JSON Web Tokens.
*   `PORT`: The port on which the backend server will run (defaults to 5001 if not set).

## Future Enhancements

*   **Due Dates & Overdue Notifications:** Implement due dates for borrowed books and notify users.
*   **Search/Filtering:** More sophisticated search options (e.g., by ISBN, publication year).
*   **Book Reviews & Ratings:** Allow users to rate and review books.
*   **User Profile Management:** Allow users to update their profile information.
*   **Pagination:** For book lists and user lists to handle large datasets.
*   **More Robust Error Handling:** Enhanced error display and logging.
*   **Image Uploads:** Allow admins to upload cover images directly instead of just URLs.

---
## Screenshots

### 🔒 Login Page
![Alt text](<Screenshot 2025-06-14 125620.png>)

### 🔒 Login Page
![Alt text](<Screenshot 2025-06-14 125635.png>)

### 📚 Home Page (User View)
![Alt text](<Screenshot 2025-06-14 125713.png>)

### 📚 Book Catalog (User View)
![Alt text](<Screenshot 2025-06-14 125746.png>)
![Alt text](<Screenshot 2025-06-14 125800.png>)

### 🧑‍💼 Admin Dashboard
![Alt text](<Screenshot 2025-06-14 125826.png>)
![Alt text](<Screenshot 2025-06-14 125851.png>)

---
## 🎥 Demo Video

## 🎥 Demo Video

[Click here to watch the demo video on Google Drive](https://drive.google.com/file/d/167PLKYhypNRdJEFqxbfUEGoQhQ_Pe2zv/view?usp=sharing)



