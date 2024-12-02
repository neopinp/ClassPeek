import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { restrictTo } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     tags:
 *       - Subjects
 *     summary: Retrieve a list of all subjects with their courses
 *     responses:
 *       200:
 *         description: A list of subjects
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
 *                     example: "Mathematics"
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
 *                           example: "MATH101"
 *                         title:
 *                           type: string
 *                           example: "Calculus I"
 *       500:
 *         description: Failed to fetch subjects
 */
router.get('/subjects', async (req: Request, res: Response) => {
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

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     tags:
 *       - Subjects
 *     summary: Retrieve a subject by ID with its courses
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The subject ID
 *     responses:
 *       200:
 *         description: Subject details
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
 *                   example: "Mathematics"
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
 *                         example: "MATH101"
 *                       title:
 *                         type: string
 *                         example: "Calculus I"
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Failed to fetch subject
 */
router.get('/subjects/:id', async (req: Request, res: Response) => {
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

// PROFESSOR restricted actions

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     tags:
 *       - Subjects
 *     summary: Create a new subject
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Physics"
 *     responses:
 *       201:
 *         description: Subject created successfully
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only professors can create subjects
 *       500:
 *         description: Failed to create subject
 */
router.post('/subjects', restrictTo(["PROFESSOR"]), async (req: Request, res: Response) => {
  try {
    console.log("Incoming subject payload:", req.body);
    const subject = await prisma.subject.create({
      data: req.body
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     tags:
 *       - Subjects
 *     summary: Delete a subject by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The subject ID
 *     responses:
 *       204:
 *         description: Subject deleted successfully
 *       400:
 *         description: Cannot delete subject with associated courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Cannot delete subject with associated courses'
 *                 message:
 *                   type: string
 *                   example: 'This subject has 2 courses associated with it:'
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 'MATH101 - Calculus I'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only professors can delete subjects
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Failed to delete subject
 */
router.delete('/subjects/:id', restrictTo(["PROFESSOR"]), (req, res) => {
  const deleteSubject = async () => {
    try {
      // First check how many courses are associated
      const subject = await prisma.subject.findUnique({
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

      if (!subject) {
        return res.status(404).json({ error: 'Subject not found' });
      }

      if (subject.courses.length > 0) {
        console.log("Subject deletion blocked, has courses still associated.");
        return res.status(400).json({
          error: 'Cannot delete subject with associated courses',
          message: `This subject has ${subject.courses.length} course${subject.courses.length === 1 ? '' : 's'} associated with it:`,
          courses: subject.courses.map(course => `${course.course_code} - ${course.title}`)
        });
      }

      // If no courses are associated, proceed with deletion
      await prisma.subject.delete({
        where: { id: parseInt(req.params.id) }
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete subject' });
    }
  };

  deleteSubject();
});

export default router;