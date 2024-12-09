import express, { Request, Response } from 'express';
import { PrismaClient, UserType } from '@prisma/client';
import { requireAuth, restrictTo } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';


const router = express.Router();
const prisma = new PrismaClient();

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
 *                 example: "1990-01-01"
 *               role:
 *                 type: string
 *                 enum: [STUDENT, PROFESSOR]
 *                 example: "STUDENT"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 user_type:
 *                   type: string
 *                   example: "STUDENT"
 *                 dob:
 *                   type: string
 *                   format: date
 *                   example: "1990-01-01"
 *                 credentials:
 *                   type: object
 *                   properties:
 *                     school_email:
 *                       type: string
 *                       format: email
 *                       example: "user@example.com"
 *                 profile:
 *                   type: object
 *                   properties:
 *                     blurb:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: "All fields are required"
 *       409:
 *         description: "User already exists"
 *       500:
 *         description: "Failed to create user"
 */
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

/**
 * @swagger
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
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: "Login successful"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     user_type:
 *                       type: string
 *                       example: "STUDENT"
 *                     dob:
 *                       type: string
 *                       format: date
 *                       example: "1990-01-01"
 *                     credentials:
 *                       type: object
 *                       properties:
 *                         school_email:
 *                           type: string
 *                           format: email
 *                           example: "user@example.com"
 *       401:
 *         description: "Invalid email or password"
 *       500:
 *         description: "Failed to log in"
 */
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

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user (requires authentication)
 *     responses:
 *       200:
 *         description: "Logged out successfully"
 *       500:
 *         description: "Failed to log out"
 */
router.post('/auth/logout', requireAuth, (req: Request, res: Response) => {
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

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get the current user's information (requires authentication)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: "Successful response"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 user_type:
 *                   type: string
 *                   example: "STUDENT"
 *                 dob:
 *                   type: string
 *                   format: date
 *                   example: "1990-01-01"
 *                 blurb:
 *                   type: string
 *                   nullable: true
 *                   example: "Short bio"
 *                 description:
 *                   type: string
 *                   nullable: true
 *                   example: "Detailed bio"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *                 professor_page:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: "Unauthorized: No session found"
 *       404:
 *         description: "User not found"
 *       500:
 *         description: "Internal server error"
 */
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
              image_data: true, // Avatar
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
        image_data: user.profile?.image_data || null,
        professor_page: user.professor_page || null,
      };

      console.log("Image data length from backend", responseData.image_data ? responseData.image_data.length : 0);
      res.json(responseData);
    } catch (error) {
      console.error('Error fetching logged-in user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  fetchUser();
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a list of all users
 *     responses:
 *       200:
 *         description: "A list of users"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   user_type:
 *                     type: string
 *                     example: "STUDENT"
 *                   dob:
 *                     type: string
 *                     format: date
 *                     example: "1990-01-01"
 *                   credentials:
 *                     type: object
 *                     properties:
 *                       school_email:
 *                         type: string
 *                         format: email
 *                         example: "user@example.com"
 *       500:
 *         description: "Internal server error"
 */
router.get('/users/:id?', (req: Request, res: Response) => {
  const fetchUsers = async () => {
    try {
      const { id } = req.params;

      if (id) {
        // Fetch a single user by ID
        const user = await prisma.user.findUnique({
          where: { id: parseInt(id) },
          include: { 
            credentials: true,
            profile: true,
          },
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

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update the user's profile (requires authentication)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blurb
 *               - description
 *             properties:
 *               blurb:
 *                 type: string
 *                 example: "Short bio"
 *               description:
 *                 type: string
 *                 example: "Detailed bio"
 *     responses:
 *       200:
 *         description: "Profile updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 blurb:
 *                   type: string
 *                   example: "Updated short bio"
 *                 description:
 *                   type: string
 *                   example: "Updated detailed bio"
 *       400:
 *         description: "Both blurb and description are required"
 *       401:
 *         description: "Unauthorized"
 *       500:
 *         description: "Failed to update profile"
 */
router.put("/users/profile", requireAuth, (req: Request, res: Response) => {
  const updateUserProfile = async () => {
    const { image_data, blurb, description } = req.body;
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
        data: { image_data, blurb, description },
      });

      console.log("Image data length to backend", image_data ? image_data.length : 0);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
  updateUserProfile();
});

/**
 * @swagger
 * /api/users/passwordreset:
 *   put:
 *     tags:
 *       - Users
 *     summary: Reset the user's password
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: "Password updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 school_email:
 *                   type: string
 *                   example: "user@university.edu"
 *                 password:
 *                   type: string
 *                   example: "$2b$10$hashedpasswordexample..."
 *       400:
 *         description: "Password field is required"
 *       401:
 *         description: "Unauthorized"
 *       500:
 *         description: "Failed to update password"
 */
router.put("/users/passwordreset", (req: Request, res: Response) => {
  const passwordReset = async () => {
    const { email, password } = req.body;
    // Normally this would have to be sent to an email. We can't use requireAuth here so we assume the user is not malicious.
    // This is horribly insecure and should never be used in an actual production.
    //const userId = req.session?.userId;
    //if (!userId) {
    //  return res.status(401).json({ error: "Unauthorized" });
    //}

    if (!password) {
      return res.status(400).json({ error: "Password field is required" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const updatedUserCredentials = await prisma.user_Credentials.update({
        where: { school_email: email },
        data: { password:hashedPassword },
      });

      res.json(updatedUserCredentials);
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ error: "Failed to update password" });
    }
  }
  passwordReset();
});

export default router;