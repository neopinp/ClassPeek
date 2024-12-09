// src/routes/ratings.ts

import { Router, Request, Response } from 'express';
import { RatingService } from '../services/ratingService';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const ratingService = new RatingService();

/**
 * @swagger
 * /api/ratings:
 *   get:
 *     tags:
 *       - Ratings
 *     summary: Retrieve the average rating for a course or professor
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the course to get the average rating for
 *       - in: query
 *         name: professorPageId
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the professor page to get the average rating for
 *     responses:
 *       200:
 *         description: Average rating retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageRating:
 *                   type: number
 *                   format: float
 *                   example: 4.5
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/ratings', (req: Request, res: Response) => {
  const getRating = async () => {
    try {
      const { courseId, professorPageId } = req.query;
  
      let averageRating: number = 0;
  
      if (professorPageId) {
        const parsedProfessorPageId = Number(professorPageId);
        averageRating = await ratingService.getAverageRatingForProfessor(parsedProfessorPageId);
      } else if (courseId) {
        const parsedCourseId = Number(courseId);
        averageRating = await ratingService.getAverageRatingForCourse(parsedCourseId);
      }
      res.status(200).json({ averageRating });
    } catch (error) {
      console.error('Error fetching average rating:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
  getRating();
});

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     tags:
 *       - Ratings
 *     summary: Submit or update a rating for a course or professor (requires authentication)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       description: Provide rating value and either courseId or professorPageId
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *               courseId:
 *                 type: integer
 *                 example: 1
 *               professorPageId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rating submitted successfully."
 *                 averageRating:
 *                   type: number
 *                   format: float
 *                   example: 4.3
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
router.post('/ratings', requireAuth, (req: Request, res: Response) => {
  const createRating = async () => {
    try {
      const { value, courseId, professorPageId } = req.body;
      const userId = req.session?.userId;
  
      // Validate user authentication
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
      }
  
      // Validate rating value
      if (typeof value !== 'number' || value < 1 || value > 5) {
        return res.status(400).json({ error: 'Rating value must be a number between 1 and 5.' });
      }

      let averageRating: number = 0;
  
      if (professorPageId) {
        const parsedProfessorPageId = Number(professorPageId);
  
        averageRating = await ratingService.submitOrUpdateProfessorRating({
          userId,
          value,
          professorPageId: parsedProfessorPageId,
        });
      } else if (courseId) {
        const parsedCourseId = Number(courseId);
  
        averageRating = await ratingService.submitOrUpdateCourseRating({
          userId,
          value,
          courseId: parsedCourseId,
        });
      }
  
      res.status(200).json({
        message: 'Rating submitted successfully.',
        averageRating,
      });
    } catch (error) {
      console.error('Error submitting/updating rating:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
  createRating();
});

/**
 * @swagger
 * /api/ratings/{id}:
 *   delete:
 *     tags:
 *       - Ratings
 *     summary: Delete a rating (requies authentication)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The rating ID
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rating deleted successfully."
 *                 id:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to delete this rating
 *       404:
 *         description: Rating not found
 *       500:
 *         description: Internal server error
 */
router.delete('/ratings/:id', requireAuth, (req: Request, res: Response) => {
  const deleteRating = async () => {
    try {
      const ratingId = Number(req.params.id);
      const userId = req.session?.userId;
  
      // Validate user authentication
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
      }
  
  
      // Attempt to delete the rating
      const deletedRating = await ratingService.deleteRating(ratingId, userId);
  
      if (!deletedRating) {
        return res.status(404).json({ error: 'Rating not found or you do not have permission to delete it.' });
      }
  
      res.status(200).json({
        message: 'Rating deleted successfully.',
        id: deletedRating.id,
      });
    } catch (error) {
      console.error('Error deleting rating:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
  deleteRating();
});

export default router;
