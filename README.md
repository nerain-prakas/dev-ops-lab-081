# Online Course Reservation System

This is a full-stack web application for an online course reservation system. The frontend is built with React and Vite, and the backend is a Flask REST API.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (which includes npm)
*   [Python](https://www.python.org/)
*   [PostgreSQL](https://www.postgresql.org/)

## Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # On Windows
    venv\\Scripts\\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

3.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up the database:**
    *   Make sure you have a PostgreSQL server running.
    *   Create a database named `course_reservation_db`.
    *   The default connection string is `postgresql://postgres:password@localhost:5432/course_reservation_db`. You can change this in the `config.py` file or by setting the `DATABASE_URL` environment variable.

5.  **Run the backend server:**
    ```bash
    python app.py
    ```
    The backend server will be running on `http://localhost:5000`.

## Frontend Setup

1.  **Navigate to the project root directory.**

2.  **Install the required npm packages:**
    ```bash
    npm install
    ```

3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend will be accessible at `http://localhost:3000`.

## Running the Application

After completing the setup for both the backend and frontend, you can open your browser and navigate to `http://localhost:3000` to use the application.
