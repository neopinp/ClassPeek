# Classpeek
The purpose of ClassPeek is to create an interactive platform for students and instructors to share and manage educational content, facilitating discussions and collaboration around courses. The application will provide features such as course management, file sharing, and discussion boards in a user-friendly, dynamic web environment.

## Overview
This application is written in **TypeScript** and built using **Vue.js**, **Express.js**, and **Prisma** to interact with a **PostgreSQL** database. The project is organized into two main directories:
- `frontend`: Contains the Vue.js application and its build logic.
- `backend`: Contains the Express.js application and its logic.

The production build for the application is always contained in the `/dist` folder within each respective directory. In production, the `./frontend/dist` folder contains the `index.html` file, which your reverse proxy (e.g., Nginx) will serve.

## Installation
Before getting started, ensure you have **VSCode** and **Node.js** installed. Verify that your Node.js and npm versions are up to date (e.g., Node.js `20.18.0` at the time of writing).

### Global Dependencies
Install the following global packages:
```bash
npm install -g typescript
npm install -g @vue/cli
npm install -g pm2
```

### Project Dependencies
Run the following command from the root directory to install all necessary dependencies for the project:
```bash
npm run install-all
```

This command automates the process of running `npm install` in the root, `frontend`, and `backend` directories.

### Database Connection
When running this for the first time, we need to create a **Prisma client** in order for our application to communicate with the backend. Run the following command if this is a fresh installation.
```bash
npm run prisma-generate
```

## Running the server
For development, the frontend runs on `http://localhost:8080`, and the backend runs on `http://localhost:3000`.

### Development
Run these commands from the **root directory** (`.../Classpeek`):
```bash
npm run dev     # Starts both backend and frontend for development
npm run client  # Starts the frontend only
npm run server  # Starts the backend only
```

### Production
1. Build the application
    ```bash
    npm run build
    ```
    This creates a production-ready build in the /dist folder for both the frontend and backend.

2. Configure your reverse proxy (e.g., Nginx or Apache):
    - Serve static files from `./frontend/dist`.
    - Route API requests (`/api/`) to `http://127.0.0.1:3000/api/`.

3. Start the backend
    ```bash
    npm run start       # Starts the server within your terminal
    npm run pm2-start   # Starts the server within a PM2 daemon
    npm run pm2-stop    # Stops the PM2 daemon
    npm run pm2-restart # Restarts the PM2 daemon
    npm run pm2-save    # Saves the PM2 daemon
    ```
