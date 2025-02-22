# Document Editor

This project is a document editor built with React and Express.
This project is developed using [CLINE](https://github.com/cline/cline) with VS CODE LM APIS along with gemini-2.0-flash-exp API.

It tooks around 3-4 hours to develop evrything just using prompts. I faced issue at the starting while using Slate component. But after giving latest updats to LLM about slate it started working.


## Architecture

The project has a frontend and a backend.

*   **Frontend:** The frontend is a React application that uses Material UI, Slate, and Styled Components. It allows users to create, edit, and delete documents.
*   **Backend:** The backend is an Express server that connects to a MongoDB database. It provides API endpoints for managing documents and uploading images.

## Running the application

To run the application locally, follow these steps:

1.  Install the dependencies:
    `npm install` in both the `backend` and `frontend` directories.
2.  Start the backend:
    `npm start` in the `backend` directory.
3.  Start the frontend:
    `npm start` in the `frontend` directory.

## Running the application with Docker Compose

To run the application with Docker Compose, follow these steps:

1.  Install Docker Compose:
    [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)
2.  Run `docker-compose up --build` in the project root directory.

The application will be available at `http://localhost`.

The backend URL is configurable via the `REACT_APP_API_URL` environment variable. The default value is `http://localhost:5000/api`. When running in Docker, the `docker-compose.yml` file sets this variable to `http://backend:5000/api`.
