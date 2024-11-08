import { Router } from 'express';
import { CommentService } from '../services/commentService';

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
    res.status(400).json({ error: (error as Error).message });
  }
});

// Delete comment
router.delete('/comments/:id', async (req, res) => {
  try {
    await commentService.deleteComment(Number(req.params.id));
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;