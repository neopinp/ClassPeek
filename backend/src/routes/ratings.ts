// src/routes/ratings.ts

import { Router, Request, Response } from 'express';
import { RatingService } from '../services/ratingService';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const ratingService = new RatingService();

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
