import { Router } from 'express';
import { CommentService } from '../services/commentService';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const commentService = new CommentService();

/**
 * @swagger
 * /api/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Retrieve comments
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter comments by course ID
 *       - in: query
 *         name: professorPageId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter comments by professor page ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter comments by parent comment ID (for replies)
 *     responses:
 *       200:
 *         description: A list of comments
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
 *                   content:
 *                     type: string
 *                     example: "This is a comment."
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   userId:
 *                     type: integer
 *                     example: 2
 *                   courseId:
 *                     type: integer
 *                     example: 3
 *                   professorPageId:
 *                     type: integer
 *                     example: 4
 *                   parentId:
 *                     type: integer
 *                     example: null
 *       400:
 *         description: Bad request
 */
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

/**
 * @swagger
 * /api/comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a new comment
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       description: Provide at least one of `courseId` or `professorPageId` to associate the comment.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is a comment."
 *               courseId:
 *                 type: integer
 *                 example: 1
 *               professorPageId:
 *                 type: integer
 *                 example: 2
 *               parentId:
 *                 type: integer
 *                 example: null
 *     responses:
 *       200:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 content:
 *                   type: string
 *                   example: "This is a comment."
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 userId:
 *                   type: integer
 *                   example: 2
 *                 courseId:
 *                   type: integer
 *                   example: 1
 *                 professorPageId:
 *                   type: integer
 *                   example: null
 *                 parentId:
 *                   type: integer
 *                   example: null
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update a comment
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The comment ID
 *     requestBody:
 *       required: true
 *       description: Provide the updated content of the comment.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated comment content."
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 content:
 *                   type: string
 *                   example: "Updated comment content."
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *                 id:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
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