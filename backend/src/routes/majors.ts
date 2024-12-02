// src/routes/majors.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { restrictTo } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/majors:
 *   get:
 *     tags:
 *       - Majors
 *     summary: Retrieve a list of all majors with their courses
 *     responses:
 *       200:
 *         description: A list of majors
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
 *                     example: "Computer Science"
 *                   description:
 *                     type: string
 *                     example: "Study of computation and information"
 *                   courses:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 101
 *                         course_code:
 *                           type: string
 *                           example: "CS101"
 *                         title:
 *                           type: string
 *                           example: "Introduction to Computer Science"
 *       500:
 *         description: Failed to fetch majors
 */
router.get('/majors', async (req: Request, res: Response) => {
  try {
    const majors = await prisma.major.findMany({
      include: {
        courses: true
      }
    });
    res.json(majors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch majors' });
  }
});

/**
 * @swagger
 * /api/majors/{id}:
 *   get:
 *     tags:
 *       - Majors
 *     summary: Retrieve a major by ID with its courses
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The major ID
 *     responses:
 *       200:
 *         description: Major details
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
 *                   example: "Computer Science"
 *                 description:
 *                   type: string
 *                   example: "Study of computation and information"
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 101
 *                       course_code:
 *                         type: string
 *                         example: "CS101"
 *                       title:
 *                         type: string
 *                         example: "Introduction to Computer Science"
 *       404:
 *         description: Major not found
 *       500:
 *         description: Failed to fetch major
 */
router.get('/majors/:id', async (req: Request, res: Response) => {
  try {
    const major = await prisma.major.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        courses: true
      }
    });
    res.json(major);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch major' });
  }
});

// PROFESSOR restricted actions

/**
 * @swagger
 * /api/majors:
 *   post:
 *     tags:
 *       - Majors
 *     summary: Create a new major
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Physics"
 *               description:
 *                 type: string
 *                 example: "Study of matter and energy"
 *     responses:
 *       201:
 *         description: Major created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *                 name:
 *                   type: string
 *                   example: "Physics"
 *                 description:
 *                   type: string
 *                   example: "Study of matter and energy"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only professors can create majors
 *       500:
 *         description: Failed to create major
 */
router.post('/majors', restrictTo(["PROFESSOR"]), async (req: Request, res: Response) => {
  try {
    console.log("Incoming major payload:", req.body);
    const major = await prisma.major.create({
      data: req.body
    });
    res.status(201).json(major);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create major' });
  }
});

/**
 * @swagger
 * /api/majors/{id}:
 *   delete:
 *     tags:
 *       - Majors
 *     summary: Delete a major by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The major ID
 *     responses:
 *       204:
 *         description: Major deleted successfully
 *       400:
 *         description: Cannot delete major with associated courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Cannot delete major with associated courses'
 *                 message:
 *                   type: string
 *                   example: 'This major has 2 courses associated with it:'
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 'CS101 - Introduction to Computer Science'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only professors can delete majors
 *       404:
 *         description: Major not found
 *       500:
 *         description: Failed to delete major
 */
router.delete('/majors/:id', restrictTo(["PROFESSOR"]), (req, res) => {
  const deleteMajor = async () => {
    try {
      // First check how many courses are associated
      const major = await prisma.major.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          courses: {
            select: {
              id: true,
              course_code: true,
              title: true
            }
          }
        }
      });

      if (!major) {
        return res.status(404).json({ error: 'Major not found' });
      }

      if (major.courses.length > 0) {
        console.log("Major deletion blocked, has courses still associated.");
        return res.status(400).json({
          error: 'Cannot delete major with associated courses',
          message: `This major has ${major.courses.length} course${major.courses.length === 1 ? '' : 's'} associated with it:`,
          courses: major.courses.map(course => `${course.course_code} - ${course.title}`)
        });
      }

      // If no courses are associated, proceed with deletion
      await prisma.major.delete({
        where: { id: parseInt(req.params.id) }
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete major' });
    }
  };

  deleteMajor();
});

export default router;