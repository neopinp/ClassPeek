// Application-wide constants, lets us change the application for different servers through here
// These specify what client (webserver) our API serves. Anything not included will be blocked by CORS in the backend.
const CLIENT_URL = [
    'https://classpeek.ecrl.marist.edu',
    'http://localhost:8080',
    'http://localhost:3000'
];

// Make sure the first CLIENT_URL entry is the one that hosts our Express.js server
const API_PATH = '/api';
const API_URL = `${CLIENT_URL[0]}${API_PATH}`;

// With how our Nginx is setup, the Express.js server is hosted on the webserver and Nginx forwards requests to our API_URL to here
const SERVER_URL = 'http://localhost:3000';

// Exporting the constants for usage elsewhere in the application
module.exports = {
  CLIENT_URL,
  API_PATH,
  API_URL,
  SERVER_URL,
};
