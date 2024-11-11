import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import courseRoutes from './routes/courses';
import subjectRoutes from './routes/subjects';
import majorRoutes from './routes/majors';
import userRoutes from './routes/users';
import professorRoutes from './routes/professors';
import commentRoutes from './routes/comments';

const app: Application = express();
const PORT: number | string = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());

app.use(cookieSession({
  name: 'session',
  keys: ['development-static-key-123'],
  maxAge: 24 * 60 * 60 * 1000,
  secure: false,
}));

// Route handlers (i.e. our apis)
app.use('/api', courseRoutes);
app.use('/api', subjectRoutes);
app.use('/api', majorRoutes);
app.use('/api', userRoutes);
app.use('/api', professorRoutes);
app.use('/api', commentRoutes)

// Track active sessions
const activeSessions = new Map<string, any>();

app.use((req: Request, res: Response, next: NextFunction): void => {
  if (req.session?.userId) {
    activeSessions.set(req.session.userId, req.session);
  }
  next();
});

// Endpoint to view active sessions (for debugging purposes)
app.get('/active-sessions', (req: Request, res: Response): void => {
  res.json(Array.from(activeSessions.entries()));
});

// Function to list all routes dynamically
const listRoutes = (app: Application): void => {
  console.log('Registered Routes:');
  (app._router.stack as Array<{ route?: { path: string; methods: Record<string, boolean> }; name?: string; handle?: any }>).forEach((middleware) => {
    if (middleware.route) {
      const method = Object.keys(middleware.route.methods)[0].toUpperCase();
      console.log(`${method} ${middleware.route.path}`);
    } else if (middleware.name === 'router' && middleware.handle?.stack) {
      middleware.handle.stack.forEach((route: any) => {
        if (route.route) {
          const method = Object.keys(route.route.methods)[0].toUpperCase();
          console.log(`${method} ${route.route.path}`);
        }
      });
    }
  });
};

// List routes on server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  listRoutes(app);
});

export default app;