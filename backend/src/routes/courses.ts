// src/routes/courses.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { restrictTo } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to get base course code
const getBaseCourseCode = (courseCode: string) => courseCode.split('-')[0];

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Retrieve a list of all courses
 *     responses:
 *       200:
 *         description: A list of courses
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
 *                   title:
 *                     type: string
 *                     example: "Introduction to Computer Science"
 *                   course_code:
 *                     type: string
 *                     example: "CS101"
 *                   description:
 *                     type: string
 *                     example: "An introductory course to computer science."
 *                   credits:
 *                     type: integer
 *                     example: 3
 *                   professor:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: "Dr. Jane Smith"
 *                   subject:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Computer Science"
 *                   majors:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Computer Science"
 *                   prerequisites:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 10
 *                         course_code:
 *                           type: string
 *                           example: "MATH101"
 *                         title:
 *                           type: string
 *                           example: "Calculus I"
 *       500:
 *         description: Failed to fetch courses
 */
router.get('/courses', async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        professor: { select: { id: true, name: true } },
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

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Retrieve a course by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "Introduction to Computer Science"
 *                 course_code:
 *                   type: string
 *                   example: "CS101"
 *                 description:
 *                   type: string
 *                   example: "An introductory course to computer science."
 *                 credits:
 *                   type: integer
 *                   example: 3
 *                 professor:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Dr. Jane Smith"
 *                 subject:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Computer Science"
 *                     code:
 *                       type: string
 *                       example: "CS"
 *                 prerequisites:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       course_code:
 *                         type: string
 *                         example: "MATH101"
 *                       title:
 *                         type: string
 *                         example: "Calculus I"
 *                 required_for:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: "Computer Science Major"
 *                 majors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Computer Science"
 *       404:
 *         description: Course not found
 *       500:
 *         description: Failed to fetch course
 */
router.get('/courses/:id', (req: Request, res: Response) => {
  const fetchCourse = async () => {
    try {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          professor: {
            select: {
              name: true
            }
          },
          subject: {
            select: {
              name: true,
              code: true
            }
          },
          prerequisites: {
            select: {
              id: true,
              course_code: true,
              title: true
            }
          },
          required_for: true,
          majors: true
        }
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Group prerequisites by base course code
      const groupedPrerequisites = course.prerequisites.reduce((acc: any[], prereq) => {
        const baseCode = getBaseCourseCode(prereq.course_code);
        if (!acc.some(p => getBaseCourseCode(p.course_code) === baseCode)) {
          acc.push({
            id: prereq.id,
            course_code: baseCode,
            title: prereq.title.split('(')[0].trim()
          });
        }
        return acc;
      }, []);

      res.json({
        ...course,
        prerequisites: groupedPrerequisites
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch course' });
    }
  };

  fetchCourse();
});

// PROFESSOR restricted actions

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Create a new course
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - course_code
 *               - description
 *               - credits
 *               - professor
 *               - subject
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Advanced Algorithms"
 *               course_code:
 *                 type: string
 *                 example: "CS301"
 *               description:
 *                 type: string
 *                 example: "An in-depth study of algorithms."
 *               credits:
 *                 type: integer
 *                 example: 4
 *               professor:
 *                 type: object
 *                 properties:
 *                   connect:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *               subject:
 *                 type: object
 *                 properties:
 *                   connect:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *               majors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 title:
 *                   type: string
 *                   example: "Advanced Algorithms"
 *                 course_code:
 *                   type: string
 *                   example: "CS301"
 *                 description:
 *                   type: string
 *                   example: "An in-depth study of algorithms."
 *                 credits:
 *                   type: integer
 *                   example: 4
 *                 professor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     name:
 *                       type: string
 *                       example: "Dr. Jane Smith"
 *                 subject:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Computer Science"
 *                 majors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Computer Science"
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only professors can create courses
 *       500:
 *         description: Failed to create course
 */
router.post('/courses', restrictTo(["PROFESSOR"]), async (req: Request, res: Response) => {
  const createCourse = async () => {
    try {
      // Log the incoming payload for debugging
      console.log("Incoming course payload:", req.body);
  
      // Extract necessary fields from the request body and attempt to create the course
      const { title, course_code, description, credits, professor, subject, prerequisites, majors } = req.body;
      const course = await prisma.course.create({
        data: {
          title,
          course_code,
          description,
          credits,
          professor: {
            connect: { id: professor.connect.id }
          },
          subject: {
            connect: { id: subject?.connect?.id }
          },
          prerequisites: prerequisites?.length > 0
            ? { connect: prerequisites.map((prereq: { id: number }) => ({ id: prereq.id })) }
            : undefined,
          majors: majors?.length > 0
            ? { connect: majors.map((major: { id: number }) => ({ id: major.id })) }
            : undefined
        },
        include: {
          professor: true,
          subject: true,
          majors: true
        }
      });
  
      // Respond with the created course
      res.status(201).json(course);
    } catch (error: any) {
      console.error("Error creating course:", error);
        res.status(500).json({ error: "Failed to create course." });
      }
    }
    createCourse();
  });

  /**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     tags:
 *       - Courses
 *     summary: Update a course by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Advanced Algorithms"
 *               course_code:
 *                 type: string
 *                 example: "CS301"
 *               description:
 *                 type: string
 *                 example: "An updated description."
 *               credits:
 *                 type: integer
 *                 example: 4
 *               professor:
 *                 type: object
 *                 properties:
 *                   connect:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 3
 *               subject:
 *                 type: object
 *                 properties:
 *                   connect:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 11
 *               majors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 title:
 *                   type: string
 *                   example: "Advanced Algorithms"
 *                 course_code:
 *                   type: string
 *                   example: "CS301"
 *                 description:
 *                   type: string
 *                   example: "An updated description."
 *                 credits:
 *                   type: integer
 *                   example: 4
 *                 professor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     name:
 *                       type: string
 *                       example: "Dr. Alan Turing"
 *                 subject:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     name:
 *                       type: string
 *                       example: "Mathematics"
 *                 majors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: "Mathematics"
 *                 prerequisites:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 11
 *                       course_code:
 *                         type: string
 *                         example: "CS201"
 *                       title:
 *                         type: string
 *                         example: "Data Structures"
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only professors can update courses
 *       404:
 *         description: Course not found
 *       500:
 *         description: Failed to update course
 */
  router.put('/courses/:id', restrictTo(["PROFESSOR"]), async (req: Request, res: Response) => {
    const updateCourse = async () => {
      try {
        const { title, course_code, description, credits, professor, subject, prerequisites, majors } = req.body;
    
        const courseId = parseInt(req.params.id);
    
        // Log incoming payload for debugging
        console.log("Updating course with payload:", req.body);
    
        // Fetch existing course with prerequisites and majors
        const existingCourse = await prisma.course.findUnique({
          where: { id: courseId },
          include: {
            prerequisites: { select: { id: true } },
            majors: { select: { id: true } },
          },
        });
    
        if (!existingCourse) {
          return res.status(404).json({ error: 'Course not found.' });
        }
    
        // Normalize majors and prerequisites payload
        const majorConnect = majors?.connect?.map((major: { id: number }) => ({ id: major.id })) || [];
        const prereqConnect = prerequisites?.map((prereq: { id: number }) => ({ id: prereq.id })) || [];
        const majorDisconnect =
          existingCourse.majors?.map((major) => ({ id: major.id })) || [];
        const prereqDisconnect =
          existingCourse.prerequisites?.map((prereq) => ({ id: prereq.id })) || [];
    
        // Update the course
        const updatedCourse = await prisma.course.update({
          where: { id: courseId },
          data: {
            title,
            course_code,
            description,
            credits,
            professor: professor?.connect?.id
              ? { connect: { id: professor.connect.id } }
              : undefined,
            subject: subject?.connect?.id
              ? { connect: { id: subject.connect.id } }
              : undefined,
            prerequisites: {
              disconnect: prereqDisconnect,
              connect: prereqConnect,
            },
            majors: {
              disconnect: majorDisconnect,
              connect: majorConnect,
            },
          },
          include: {
            professor: true,
            subject: true,
            majors: true,
            prerequisites: true,
          },
        });
    
        res.json(updatedCourse);
      } catch (error: any) {
        console.error("Error updating course:", error);
        res.status(500).json({ error: 'Failed to update course.' });
      }
    }
    updateCourse();
  });


  /**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     tags:
 *       - Courses
 *     summary: Delete a course by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The course ID
 *     responses:
 *       204:
 *         description: Course deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only professors can delete courses
 *       404:
 *         description: Course not found
 *       500:
 *         description: Failed to delete course
 */
router.delete('/courses/:id', restrictTo(["PROFESSOR"]), async (req: Request, res: Response) => {
  try {
    console.log("Deleting course w/ payload:", req.body);
    await prisma.course.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;