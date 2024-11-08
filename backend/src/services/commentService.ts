import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CommentService {
  async createComment(data: {
    content: string;
    userId?: number; // Made optional for now
    courseId?: number;
    professorPageId?: number;
    parentId?: number;
  }) {
    return prisma.comment.create({
      data: {
        content: data.content,
        // Temporary: Use a placeholder user until user system is implemented
        user: { connect: { id: 1 } }, // You'll need at least one user in the database
        ...(data.courseId && { course: { connect: { id: data.courseId } } }),
        ...(data.professorPageId && {
          professor_page: { connect: { id: data.professorPageId } },
        }),
        ...(data.parentId && { parent_comment: { connect: { id: data.parentId } } }),
      },
      include: {
        user: {
          select: {
            name: true,
            user_type: true,
          },
        },
      },
    });
  }

  async getComments({
    courseId,
    professorPageId,
    parentId = null,
  }: {
    courseId?: number;
    professorPageId?: number;
    parentId?: number | null;
  }) {
    return prisma.comment.findMany({
      where: {
        course_id: courseId,
        professor_page_id: professorPageId,
        parent_id: parentId,
      },
      include: {
        user: {
          select: {
            name: true,
            user_type: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                name: true,
                user_type: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async updateComment(commentId: number, content: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            name: true,
            user_type: true,
          },
        },
      },
    });
  }

  async deleteComment(commentId: number) {
    return prisma.comment.delete({
      where: { id: commentId },
    });
  }
}