import { Router } from 'express';
import { ReportService } from '../services/reportService';
import { requireAuth, restrictTo } from '../middleware/auth.middleware';
import { ReportStatus } from '@prisma/client';

const router = Router();
const reportService = new ReportService();

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all reports (admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, RESOLVED, DISMISSED]
 *         required: false
 *         description: Filter reports by status
 *     responses:
 *       200:
 *         description: A list of reports
 */
router.get("/reports", requireAuth, restrictTo(['ADMIN']), async (req, res) => {
  const { status } = req.query;
  try {
    const validStatus = status && Object.values(ReportStatus).includes(status as ReportStatus)
      ? (status as ReportStatus)
      : undefined;

    const reports = await reportService.getReports(validStatus);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update a report's status (admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The report ID
 *     requestBody:
 *       required: true
 *       description: Provide the updated status.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, RESOLVED, DISMISSED]
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put("/reports/:id", requireAuth, restrictTo(['ADMIN']), (req, res) => {
  const editReport = async () => {
    const { status } = req.body;
    const reportId = Number(req.params.id);
    const adminUserId = req.session?.userId;

    if (!status || !Object.values(ReportStatus).includes(status as ReportStatus)) {
      return res.status(400).json({ error: "Invalid or missing report status." });
    }

    try {
      const updated = await reportService.updateReportStatus(reportId, status as ReportStatus, adminUserId);
      res.json(updated);
    } catch (error) {
      console.error("Error updating report status:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  }
  editReport();
});

export default router;
