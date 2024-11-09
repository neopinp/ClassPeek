// src/routes/users.ts
import express, { Request, response, Response } from 'express';
import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        credentials: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', async (req: Request, res: Response) => {
  try {
    const { password, userData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    

    const user = await prisma.user.create({
      data: {
        ...userData,
        credentials: {
          create: {
            school_email: userData.email,
            password: hashedPassword
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