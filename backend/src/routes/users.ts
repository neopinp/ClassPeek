// src/routes/users.ts
import express, { Request, Response } from 'express';
import { PrismaClient, UserType } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/auth/login', (req: Request, res: Response) => {
  const loginUser = async () => {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findFirst({
        where: { credentials: { school_email: email } },
        include: { credentials: true }
      });

      if (!user || !user.credentials) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.credentials.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Set session data
      if (req.session) {
        req.session.userId = user.id;
        req.session.userType = user.user_type;
      }

      res.json({ message: 'Login successful', user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to log in' });
    }
  };

  loginUser();
});

router.post('/auth/logout', (req: Request, res: Response) => {
  const logoutUser = async () => {
    try {
      if (req.session) {
        req.session = null; // Clear the session
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to log out' });
    }
  };

  logoutUser();
});

router.get('/users/me', requireAuth, (req: Request, res: Response) => {
  const fetchUser = async () => {
    try {
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: No session found' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          credentials: {
            select: { school_email: true },
          },
          profile: {
            select: {
              blurb: true, // Short bio
              description: true, // Detailed bio
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prepare the response data
      const responseData = {
        id: user.id,
        name: user.name,
        user_type: user.user_type,
        dob: user.dob,
        bio: user.profile?.blurb || user.profile?.description || null, // Use available bio
        email: user.credentials?.school_email || null,
      };

      res.json(responseData);
    } catch (error) {
      console.error('Error fetching logged-in user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  fetchUser();
});

router.get('/users/:id?', (req: Request, res: Response) => {
  const fetchUsers = async () => {
    try {
      const { id } = req.params;

      if (id) {
        // Fetch a single user by ID
        const user = await prisma.user.findUnique({
          where: { id: parseInt(id) },
          include: { credentials: true },
        });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        return res.json(user);
      } else {
        // Fetch all users
        const users = await prisma.user.findMany({
          include: { credentials: true },
        });

        return res.json(users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  fetchUsers();
});


router.post('/users', async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const name = userData.name;
    const dob =  new Date('1980-03-20');
    const user_type = UserType.STUDENT; 
    const email = userData.email;
    const password = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: name,
        user_type: user_type,  // Using enum to ensure type safety
        dob: dob,
        credentials: {
          create: {
            school_email: email,
            password: password
          }
        }
      },
      include: {
        profile: true,
        credentials: true
      }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;