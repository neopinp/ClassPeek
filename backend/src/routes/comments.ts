import { Router } from 'express';
import { CommentService } from '../services/commentService';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const commentService = new CommentService();

// Get comments
router.get("/comments", async (req, res) => {
  try {
    const { courseId, professorPageId, parentId } = req.query;

    const comments = await commentService.getComments({
      courseId: courseId ? Number(courseId) : undefined,
      professorPageId: professorPageId ? Number(professorPageId) : undefined,
      parentId: parentId ? Number(parentId) : null,
    });

    res.json(comments);
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(400).json({ error: (error as Error).message });
  }
});

// Create comment
router.post("/comments", requireAuth, (req, res) => {
  const createComment = async () => {
    try {
      const { content, courseId, professorPageId, parentId } = req.body;
      const userId = req.session?.userId; // Get user ID from session

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const comment = await commentService.createComment({
        content,
        courseId,
        professorPageId,
        parentId,
        userId,
      });

      console.log("Comment created from payload: ", req.body)

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  }
  createComment();
});

// Update comment
router.put("/comments/:id", requireAuth, async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await commentService.updateComment(
      Number(req.params.id),
      content
    );
    console.log("Updated comment with payload: ", req.body)
    res.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(400).json({ error: (error as Error).message });
  }
});

// Delete comment
router.delete("/comments/:id", requireAuth, async (req, res) => {
  try {
    const result = await commentService.deleteComment(Number(req.params.id));
    res.json({ message: "Comment deleted successfully", id: result.id });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;