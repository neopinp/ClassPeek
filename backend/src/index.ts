import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the ClassPeek Backend!');
});


// TODO - Create routes to retrieve information about courses, subjects, and majors
// (Course ID, Course Description, Credits, and Prerequsite Courses)
// Consider api/courses, api/courses/id, etc



// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
