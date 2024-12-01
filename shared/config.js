// Application-wide constants, lets us change the application for different servers through here
// Vue detects whether we are in development or production mode...
const ENV = process.env.NODE_ENV || 'development';

// ... and as such we can set our URLs accordingly
const CLIENT_URL =
  ENV === 'production'
    ? 'https://classpeek.ecrl.marist.edu'
    : 'http://localhost:8080';

const API_PATH = '/api';
const API_URL = `${CLIENT_URL}${API_PATH}`;

const SERVER_URL = 'http://localhost:3000';

// Exporting the constants for usage elsewhere in the application
module.exports = {
  CLIENT_URL,
  API_PATH,
  API_URL,
  SERVER_URL,
};