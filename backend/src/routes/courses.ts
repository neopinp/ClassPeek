// src/routes/courses.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        professor: true,
        subject: true,
        majors: true,
        prerequisites: true
      }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.get('/courses/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        professor: true,
        subject: true,
        majors: true,
        prerequisites: true
      }
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const course = await prisma.course.create({
      data: req.body,
      include: {
        professor: true,
        subject: true,
        majors: true
      }
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const course = await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        professor: true,
        subject: true,
        majors: true
      }
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await prisma.course.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;