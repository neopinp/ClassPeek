import express, { Application, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'; 
import cors from 'cors';
import cookieSession from 'cookie-session';
import courseRoutes from './routes/courses';
import subjectRoutes from './routes/subjects';
import majorRoutes from './routes/majors';
import userRoutes from './routes/users';
import professorRoutes from './routes/professors';
import commentRoutes from './routes/comments';
import { requireAuth } from './middleware/auth.middleware';

const app: Application = express();
const prisma = new PrismaClient();
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
  sameSite: 'lax', // Cookies persist for navigation and subdomains.
}));

// Debugging session
app.use((req, res, next) => {
  console.log("Session in middleware:", req.session);
  next();
});

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
app.use('/api', courseRoutes);
app.use('/api', subjectRoutes);
app.use('/api', majorRoutes);
app.use('/api', userRoutes);
app.use('/api', professorRoutes);
app.use('/api', commentRoutes)

// Root Route: Backend Output + User Table
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;