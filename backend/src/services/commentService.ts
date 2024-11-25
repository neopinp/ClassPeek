import { PrismaClient } from '@prisma/client';

export class CommentService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient
  }

  async createComment({
    content,
    courseId,
    professorPageId,
    parentId,
    userId,
  }: {
    content: string;
    courseId?: number;
    professorPageId?: number;
    parentId?: number | null;
    userId: number;
  }) {
    try {
      return await this.prisma.comment.create({
        data: {
          content,
          course_id: courseId || null,
          professor_page_id: professorPageId || null,
          parent_id: parentId || null,
          user_id: userId, // Associate with logged-in user
        },
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      throw new Error("Failed to create comment");
    }
  }

  async getComments({
    courseId,
    professorPageId,
    parentId,
  }: {
    courseId?: number;
    professorPageId?: number;
    parentId?: number | null;
  }) {
    try {
      return await this.prisma.comment.findMany({
        where: {
          course_id: courseId,
          professor_page_id: professorPageId,
          parent_id: parentId,
        },
        include: {
          user: { select: { id: true, name: true, user_type: true } }, // Include user details
          replies: {
            include: {
              user: true
            }
          }
        },
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw new Error("Failed to fetch comments");
    }
  }

    // Update a comment
  async updateComment(id: number, content: string) {
      try {
        return await this.prisma.comment.update({
          where: { id },
          data: { content },
        });
      } catch (error) {
        console.error("Error updating comment:", error);
        throw new Error("Failed to update comment");
      }
  }

  async deleteComment(id: number) {
    try {
      return await this.prisma.comment.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw new Error("Failed to delete comment");
    }
  }

}