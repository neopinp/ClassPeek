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
            school_email: userData.email,
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