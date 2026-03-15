# Online Course Reservation System

This is a full-stack web application for an online course reservation system, built with the MERN stack (MongoDB, Express, React, Node.js) and using Vite for the frontend.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (which includes npm)
*   [MongoDB](https://www.mongodb.com/try/download/community)

## Setup and Installation

1.  **Clone the repository.**

2.  **Install frontend dependencies:**
    From the project root directory, run:
    ```bash
    npm install
    ```

3.  **Install backend dependencies:**
    Navigate to the `server` directory and run:
    ```bash
    cd server
    npm install
    ```

4.  **Set up environment variables:**
    In the `server` directory, create a `.env` file and add the following, replacing the placeholder values with your own:
    ```
    MONGO_URI=mongodb://localhost:27017/course_reservation_db
    JWT_SECRET=your_jwt_secret_key
    ```

## Running the Application

You will need to run the frontend and backend servers concurrently in separate terminals.

1.  **Run the backend server:**
    From the `server` directory, run:
    ```bash
    npm start
    ```
    The backend server will start on `http://localhost:5000`.

2.  **Run the frontend development server:**
    From the project root directory, run:
    ```bash
    npm run dev
    ```
    The frontend will be accessible at `http://localhost:3000`. API requests will be automatically proxied to the backend server.

## Production Build

1.  **Build the frontend:**
    From the project root directory, run:
    ```bash
    npm run build
    ```
    This will build the React app and place the static files in the `dist` directory.

2.  **Run the application in production:**
    The Express server is configured to serve the static frontend files in a production environment. Simply start the server from the `server` directory:
    ```bash
    npm start
    ```
    The entire application will be available at `http://localhost:5000`.
