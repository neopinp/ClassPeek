import express, { Application, Request, Response } from 'express';
import { swaggerDocs, swaggerUi } from './swagger';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import cookieSession from 'cookie-session';
import courseRoutes from './routes/courses';
import subjectRoutes from './routes/subjects';
import majorRoutes from './routes/majors';
import userRoutes from './routes/users';
import professorRoutes from './routes/professors';
import commentRoutes from './routes/comments';
import ratingRoutes from './routes/ratings';
const path = require('path');

const app: Application = express();
const prisma = new PrismaClient();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '127.0.0.1';
const { CLIENT_URL } = require(path.resolve(__dirname, '../../shared/config'));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps or Postman)
    if (!origin || CLIENT_URL.includes(origin)) {
      // Track origin for debugging in console
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Track incoming origins in console for debugging
app.use((req, res, next) => {
  if (req.get('Origin')) {
    console.log('Incoming request origin:', req.get('Origin'));
    console.log('Allowed Origins:', CLIENT_URL);
  }
  next();
});

// Middleware for parsing UI
app.use(express.json());

// Middleware for using Swagger for API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware to facilitate user sessions via cookieSession
app.use(cookieSession({
  name: 'session',
  keys: ['development-static-key-123'],
  maxAge: 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production',  // Use secure cookies for production (https://)
  sameSite: 'lax',                                // Cookies persist for navigation and subdomains.
}));

// Middleware to track active sessions with user names
const activeSessions: Record<string, { userId: number; userType: string; userName: string }> = {};
app.use(async (req, res, next) => {
  if (req.session?.userId && req.session?.userType) {
    // Fetch the user name based on userId
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { name: true }
    });

    if (user) {
      activeSessions[req.session.userId] = {
        userId: req.session.userId,
        userType: req.session.userType,
        userName: user.name,
      };
    }
  }
  next();
});

// Route handlers (i.e. our apis)
// From the API route you've imported, reference it here with the /api prefix
// Works in conjunction with the routes further specified in the files (i.e. '/api' + '/courses')
app.use('/api', courseRoutes);
app.use('/api', subjectRoutes);
app.use('/api', majorRoutes);
app.use('/api', userRoutes);
app.use('/api', professorRoutes);
app.use('/api', commentRoutes);
app.use('/api', ratingRoutes);

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Root Route: Backend Output + User Table
// This is meant for debugging, so when accessing localhost:3000 we can see all users noted and any and all active sessions.
app.get("/", async (req: Request, res: Response) => {
  try {
    // Fetch all users
    const users = await prisma.user.findMany({
      include: { profile: true, credentials: true },
    });

    // Generate HTML output
    res.send(`
      <html>
        <head>
          <title>Classpeek Backend</title>
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f4f4f4;
            }
          </style>
        </head>
        <body>
          <h1>Welcome to the Classpeek backend!</h1>
          <h2>Active Sessions</h2>
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>User Name</th>
                <th>User Type</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(activeSessions)
                .map(
                  (session) => `
                  <tr>
                    <td>${session.userId}</td>
                    <td>${session.userName}</td>
                    <td>${session.userType}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <h2>All Users</h2>
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>User Type</th>
                <th>Name</th>
                <th>Email</th>
                <th>Blurb</th>
              </tr>
            </thead>
            <tbody>
              ${users
                .map(
                  (user) => `
                  <tr>
                    <td>${user.id}</td>
                    <td>${user.user_type}</td>
                    <td>${user.name}</td>
                    <td>${user.credentials?.school_email || "N/A"}</td>
                    <td>${user.profile?.blurb || "N/A"}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Failed to fetch data");
  }
});

// Output current backend server status to console
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Swagger docs available at http://${HOST}:${PORT}/api-docs`)
});

export default app;
