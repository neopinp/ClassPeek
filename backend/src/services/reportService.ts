import { PrismaClient, ReportStatus } from '@prisma/client';

export class ReportService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createReport({
    commentId,
    userId,
    reason,
  }: {
    commentId: number;
    userId: number;
    reason: string;
  }) {
    try {
      return await this.prisma.report.create({
        data: {
          comment_id: commentId,
          reported_by_user_id: userId,
          reason,
        },
      });
    } catch (error) {
      console.error("Error creating report:", error);
      throw new Error("Failed to create report");
    }
  }

  async getReports(status?: ReportStatus) {
    try {
      const whereClause = status ? { status } : {};
      return await this.prisma.report.findMany({
        where: whereClause,
        include: {
          comment: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
          reported_by: { select: { id: true, name: true } },
          handled_by: { select: { id: true, name: true } },
        },
        orderBy: {
          created_at: 'desc',
        }
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw new Error("Failed to fetch reports");
    }
  }

  async updateReportStatus(reportId: number, status: ReportStatus, handledByUserId?: number) {
    try {
      return await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status,
          handled_by_user_id: handledByUserId || null,
        },
      });
    } catch (error) {
      console.error("Error updating report status:", error);
      throw new Error("Failed to update report status");
    }
  }

  async getReportById(reportId: number) {
    try {
      return await this.prisma.report.findUnique({
        where: { id: reportId },
        include: {
          comment: true,
          reported_by: true,
          handled_by: true,
        }
      });
    } catch (error) {
      console.error("Error fetching report:", error);
      throw new Error("Failed to fetch report");
    }
  }
}
