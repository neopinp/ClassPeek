import { Router } from 'express';
import { FileService } from '../services/fileService';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const fileService = new FileService();

/**
 * @swagger
 * /files:
 *   get:
 *     tags:
 *       - Files
 *     summary: Retrieve a list of files
 *     description: Retrieve a list of files. Can optionally filter by user ID.
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the user who owns the files
 *     responses:
 *       200:
 *         description: A list of files.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 *       400:
 *         description: Bad request. Possibly invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/files", async (req, res) => {
    try {
      const { user_id } = req.query;
  
      const files = await fileService.getFiles({
        user_id: Number(user_id)
      });
  
      res.json(files);
    } catch (error) {
      console.error("Error getting files:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

/**
 * @swagger
 * /files/{title}:
 *   get:
 *     tags:
 *       - Files
 *     summary: Retrieve a specific file by title
 *     description: Retrieve a specific file by its title. Can optionally filter by user ID.
 *     parameters:
 *       - in: path
 *         name: title
 *         schema:
 *           type: string
 *         required: true
 *         description: Title of the file to retrieve
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the user who owns the file
 *     responses:
 *       200:
 *         description: A single file matching the title.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       400:
 *         description: Bad request. Possibly invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: File not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/files/:title", async (req, res) => {
    try {
      const { user_id, title } = req.query;
  
      const files = await fileService.getFile({
        user_id: Number(user_id),
        title: title ? title.toString() : "" 
      });
  
      res.json(files);
    } catch (error) {
      console.error("Error getting files:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

/**
 * @swagger
 * /files:
 *   post:
 *     tags:
 *       - Files
 *     summary: Create a new file
 *     description: Create a new file. Authentication required.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the file
 *                 example: "Project Plan"
 *               type:
 *                 type: string
 *                 description: Type of the file (e.g., pdf, docx)
 *                 example: "pdf"
 *               content:
 *                 type: string
 *                 description: Content or URL of the file
 *                 example: "https://example.com/files/project-plan.pdf"
 *     responses:
 *       200:
 *         description: File created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       400:
 *         description: Bad request. Possibly missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized. Authentication token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/files", requireAuth, (req, res) => {
  const createFile = async () => {
    try {
      const { title, type, content } = req.body;
      const userId = req.session?.userId; // Get user ID from session

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const file = await fileService.createFile({
        title: title,
        type: type,
        content: content,
        user_id:userId,
      });

      console.log("File created from payload: ", req.body)

      res.json(file);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  }
  createFile();
});

/**
 * @swagger
 * /files/{id}:
 *   delete:
 *     tags:
 *       - Files
 *     summary: Delete a file by ID
 *     description: Delete a specific file by its ID. Authentication required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the file to delete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - title
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user attempting to delete the file
 *                 example: 2
 *               title:
 *                 type: string
 *                 description: Title of the file to delete
 *                 example: "Project Plan"
 *     responses:
 *       200:
 *         description: File deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File deleted successfully"
 *                 id:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Bad request. Possibly invalid ID or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized. Authentication token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden. User does not have permission to delete this file.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: File not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/comments/:id", requireAuth, async (req, res) => {
    try {
    const { user_id, title} = req.body;
      const result = await fileService.deleteFile(user_id,title);
      res.json({ message: "File deleted successfully", id: result.id });
    } catch (error) {
      console.error("Error deleting File:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

export default router;