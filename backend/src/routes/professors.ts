// src/routes/professors.ts
import express, { Request, Response } from 'express';
import { PrismaClient, UserType } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/professors:
 *   get:
 *     tags:
 *       - Professors
 *     summary: Retrieve a list of all professors
 *     responses:
 *       200:
 *         description: A list of professors
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
 *                     example: "Dr. John Smith"
 *                   user_type:
 *                     type: string
 *                     example: "PROFESSOR"
 *                   credentials:
 *                     type: object
 *                     properties:
 *                       school_email:
 *                         type: string
 *                         example: "drsmith@example.edu"
 *                   professor_page:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       bio:
 *                         type: string
 *                         example: "Dr. Smith is a professor of Computer Science..."
 *                   courses_taught:
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
 *         description: Failed to fetch professors
 */
router.get('/professors', async (req: Request, res: Response) => {
  try {
    const professors = await prisma.user.findMany({
      where: {
        user_type: UserType.PROFESSOR
      },
      include: {
        professor_page: true,
        courses_taught: true,
        credentials: {
          select: {
            school_email: true
          }
        }
      }
    });
    res.json(professors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch professors' });
  }
});

/**
 * @swagger
 * /api/professors/{id}:
 *   get:
 *     tags:
 *       - Professors
 *     summary: Retrieve a professor by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The professor ID
 *     responses:
 *       200:
 *         description: Professor details
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
 *                   example: "Dr. John Smith"
 *                 user_type:
 *                   type: string
 *                   example: "PROFESSOR"
 *                 credentials:
 *                   type: object
 *                   properties:
 *                     school_email:
 *                       type: string
 *                       example: "drsmith@example.edu"
 *                 professor_page:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     bio:
 *                       type: string
 *                       example: "Dr. Smith is a professor of Computer Science..."
 *                 courses_taught:
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
 *         description: Professor not found
 *       500:
 *         description: Failed to fetch professor
 */
router.get('/professors/:id', async (req: Request, res: Response) => {
  try {
    const professor = await prisma.user.findFirst({
      where: {
        id: parseInt(req.params.id),
        user_type: UserType.PROFESSOR
      },
      include: {
        professor_page: true,
        courses_taught: true,
        credentials: {
          select: {
            school_email: true
          }
        }
      }
    });
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch professor' });
  }
});

/**
 * @swagger
 * /api/professors/{id}/page:
 *   put:
 *     tags:
 *       - Professors
 *     summary: Update a professor's page
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The professor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: "Updated biography..."
 *               office_hours:
 *                 type: string
 *                 example: "Mon-Wed 2pm-4pm"
 *               contact_info:
 *                 type: string
 *                 example: "Email: drsmith@example.edu"
 *     responses:
 *       200:
 *         description: Professor page updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 10
 *                 professor_id:
 *                   type: integer
 *                   example: 1
 *                 bio:
 *                   type: string
 *                   example: "Updated biography..."
 *                 office_hours:
 *                   type: string
 *                   example: "Mon-Wed 2pm-4pm"
 *                 contact_info:
 *                   type: string
 *                   example: "Email: drsmith@example.edu"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only the professor can update their page
 *       404:
 *         description: Professor page not found
 *       500:
 *         description: Failed to update professor page
 */
router.put('/professors/:id/page', requireAuth, async (req: Request, res: Response) => {
  try {
    const professorPage = await prisma.professorPage.update({
      where: { professor_id: parseInt(req.params.id) },
      data: req.body
    });
    console.log(`Updating professor ${req.params.id} page with payload: ${req.body}`);
    res.json(professorPage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update professor page' });
  }
});

/**
 * @swagger
 * /api/professors/{id}:
 *   delete:
 *     tags:
 *       - Professors
 *     summary: Delete a professor's page
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The professor ID
 *     responses:
 *       204:
 *         description: Professor page deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only the professor can delete their page
 *       404:
 *         description: Professor page not found
 *       500:
 *         description: Failed to delete professor page
 */
router.delete('/professors/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.$transaction(async (tx) => {
      // First we have to delete the associated comments with the table.
      await tx.comment.deleteMany({
        where: { professor_page_id: parseInt(req.params.id) }
      });
      
      await tx.professorPage.delete({
        where: { id: parseInt(req.params.id) }
      });
    });
    console.log(`Deleted professor ${req.params.id} page`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete professor page'});
  }
});

export default router;