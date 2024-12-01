import express, { Request, Response } from 'express';
import { PrismaClient, UserType } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';

// Swagger Docs notation
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dob
 *               - role
 *               - email
 *               - name
 *               - password
 *             properties:
 *               dob:
 *                 type: string
 *                 format: date
 *               role:
 *                 type: string
 *                 enum: [STUDENT, PROFESSOR]
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully created
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 * 
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 * 
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Server error
 */

const router = express.Router();
const prisma = new PrismaClient();

router.post('/auth/signup', (req: Request, res: Response) => {
  const signUpUser = async () => {
    const { dob, role, email, name, password } = req.body;

    try {
      // Ensure all required fields are present
      if (!dob || !role || !email || !name || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if the user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          credentials: {
            school_email: email,
          },
        },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user
      const newUser = await prisma.user.create({
        data: {
          name,
          user_type: role,
          dob: new Date(dob),
          credentials: {
            create: {
              school_email: email,
              password: hashedPassword,
            },
          },
          profile: {
            create: {
              blurb: null, // Default to null or handle via the form
            },
          },
        },
        include: {
          profile: true,
          credentials: true,
        },
      });
      console.log(`User signed up: ${role}, ${dob}, ${email}, ${name}`);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  };

  signUpUser();
});

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
      console.log('User signed in: ', req.session)
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
          professor_page: req.session?.userType === 'PROFESSOR' ? true : false,
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
        blurb: user.profile?.blurb || null,
        description: user.profile?.description || null,
        email: user.credentials?.school_email || null,
        professor_page: user.professor_page || null,
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

router.put("/users/profile", requireAuth, (req: Request, res: Response) => {
  const updateUserProfile = async () => {
    const { blurb, description } = req.body;
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!blurb || !description) {
      return res.status(400).json({ error: "Both blurb and description are required" });
    }

    try {
      const updatedProfile = await prisma.profile.update({
        where: { user_id: userId },
        data: { blurb, description },
      });

      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
  updateUserProfile();
});

export default router;