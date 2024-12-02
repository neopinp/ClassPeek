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
