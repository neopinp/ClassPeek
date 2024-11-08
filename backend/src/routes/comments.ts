import { Router } from 'express';
import { CommentService } from '../services/commentService';

interface Comment {
  id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
  user: {
    id: number;
    name: string;
    user_type: 'STUDENT' | 'PROFESSOR';
  };
  course_id?: number;
  professor_page_id?: number;
  parent_id?: number;
  replies?: Comment[];
}

const router = Router();
const commentService = new CommentService();

// Get comments
router.get('/comments', async (req, res) => {
  try {
    const { courseId, professorPageId, parentId } = req.query;
    
    const comments = await commentService.getComments({
      courseId: courseId ? Number(courseId) : undefined,
      professorPageId: professorPageId ? Number(professorPageId) : undefined,
      parentId: parentId ? Number(parentId) : null,
    });

    res.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(400).json({ error: (error as Error).message });
  }
});

// Create comment
router.post('/comments', async (req, res) => {
  try {
    const { content, courseId, professorPageId, parentId } = req.body;

    const comment = await commentService.createComment({
      content,
      courseId,
      professorPageId,
      parentId,
    });

    res.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(400).json({ error: (error as Error).message });
  }
});

// Update comment
router.put('/comments/:id', async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await commentService.updateComment(
      Number(req.params.id),
      content
    );
    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(400).json({ error: (error as Error).message });
  }
});

// Delete comment
router.delete('/comments/:id', async (req, res) => {
  try {
    const result = await commentService.deleteComment(Number(req.params.id));
    res.json({ message: 'Comment deleted successfully', id: result.id });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;