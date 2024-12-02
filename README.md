# Classpeek
The purpose of ClassPeek is to create an interactive platform for students and instructors to share and manage educational content, facilitating discussions and collaboration around courses. The application will provide features such as course management, file sharing, and discussion boards in a user-friendly, dynamic web environment.

## Overview
This application is written in **TypeScript** and built using **Vue.js**, **Express.js**, and **Prisma** to interact with a **PostgreSQL** database. The project is organized into two main directories:
- `frontend`: Contains the Vue.js application and its build logic.
- `backend`: Contains the Express.js application and its logic.

The production build for the application is always contained in the `/dist` folder within each respective directory. In production, the `./frontend/dist` folder contains the `index.html` file, which your reverse proxy (e.g., Nginx) will serve.

The **API documentation**, once your application has been completely setup, can be viewed at `<server_ip>/api-docs`. For example, with our current ECRL build, `https://classpeek.ecrl.marist.edu/api-docs/`.

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

### Creating the PostgreSQL database
This project is hosted on a webserver and the database was setup on that as well. These installation instructions are run on **Linux**, but if you wish to install it for **Windows** then the configuration files mentioned should be accessable via `C:\Program Files\PostgreSQL\<version>\data`. Additionally, accessing the `psql` shell would either be done via the created shortcut from installing it on Windows or from the Windows CLI. (Have fun with PATH) 

1. First install PostgreSQL with your package manager of choice.
    ```bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib -y
    ```

2. Once it is installed, access the PostgreSQL shell and run the following commands.
    ```bash
    sudo -i u postgres                                  # Swap to the postgres user
    psql
    # Within psql shell
    CREATE DATABASE classpeek;
    CREATE USER username WITH PASSWORD 'password';      # Replace username and password with your desired credentials
    GRANT ALL PRIVILEGES ON DATABASE classpeek TO username;
    \c classpeek                                        # Connect to the classpeek database we just created
    ALTER USER username SET search_path TO classpeek;   # Set classpeek as the default schema for username
    \q                                                  # Exit the shell
    ```

3. One we have created the schema for classpeek, we want to change the configuration file to listen on all addresses so outside devices can communicate with the database. (Note that you can choose to specify a range of addresses or specific addresses, this was done for ease). Here we use nano but you can use your text editor of choice.
    ```bash
    sudo nano /etc/postgresql/<version>/main/postgresql.conf    # Replace version with your version of PostgreSQL (i.e. 16)
    ```

4. Once within the file, locate the line starting with `listen_addresses` and set it to listen to **all addresses**/
    ```conf
    listen_addresses = '*'
    ```

5. Now we go into our `pg_hba.conf` file to change our client authentication settings to allow **external connections**.
    ```bash
    sudo nano /etc/postgresql/<version>/main/pg_hba.conf        # Replace version with your version of PostgreSQL (i.e. 16)
    ```

6. In this file, add the following line to allow connections from **any IP address**. (Note that you can replace `0.0.0.0/0` with a specific IP range if you want)
    ```conf
    host    all             all             0.0.0.0/0               md5
    ```

7. Once you've finished this, restart the PostgreSQL service to apply all of our changes.
    ```bash
    sudo systemctl restart postgresql
    ```

8. We can run this line from any device to test our connection. Use this to verify that our connection works and we can interact with the `classpeek` database.
    ```bash
    psql -h <server-ip> -U username -d classpeek
    ```

9. Once we have verified that our schema is working, change the following line in the `.env` file within `/backend` so our application can communicate with the database.
    ```conf
    DATABASE_URL="postgresql://<username>:<password>@<server_ip>:5432/classpeek?schema=public"
    ```

10. **Optional**: Add a firewall rule for PostgreSQL on port 5432 (default port for PostgreSQL)
    ```bash
    sudo ufw allow 5432/tcp
    ```

### Database Connection
When running this for the first time, we need to create a **Prisma client** in order for our application to communicate with the backend. Run the following command if this is a fresh installation.
```bash
npm run prisma-generate
```

Additionally, we also need to push our schema onto the new database. This is done with the following command
```bash
npx prisma db push
```

## Setting up the configuration
Classpeek works on server addresses by refering to a `config.js` stored with the `/shared` directory. It looks like this by default.
```js
// Application-wide constants, lets us change the application for different servers through here
const CLIENT_URL = [
    'https://classpeek.ecrl.marist.edu',
    'http://localhost:8080',
    'http://localhost:3000'
];

const API_PATH = '/api';
const API_URL = `${CLIENT_URL[0]}${API_PATH}`;

const SERVER_URL = 'http://localhost:3000';

// Exporting the constants for usage elsewhere in the application
module.exports = {
  CLIENT_URL,
  API_PATH,
  API_URL,
  SERVER_URL,
};
```

To get this working with your setup, just change the **first** CLIENT_URL entry to your **server address**.

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
