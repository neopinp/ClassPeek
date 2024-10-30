// src/routes/subjects.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/subjects', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        courses: true
      }
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.get('/subjects/:id', async (req, res) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        courses: true
      }
    });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const subject = await prisma.subject.create({
      data: req.body
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

export default router;