import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import courseRoutes from './routes/courses';
import subjectRoutes from './routes/subjects';
import majorRoutes from './routes/majors';
import userRoutes from './routes/users';
import professorRoutes from './routes/professors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: ['development-static-key-123'],
  maxAge: 24 * 60 * 60 * 1000
}));

// Route handlers (i.e. our apis)
app.use('/api', courseRoutes);
app.use('/api', subjectRoutes);
app.use('/api', majorRoutes);
app.use('/api', userRoutes);
app.use('/api', professorRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;