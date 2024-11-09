import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CommentService {
  async createComment(data: {
    content: string;
    userId?: number;
    courseId?: number;
    professorPageId?: number;
    parentId?: number;
  }) {
    return prisma.comment.create({
      data: {
        content: data.content,
        user: { connect: { id: 1 } }, // Temporary user
        ...(data.courseId && { course: { connect: { id: data.courseId } } }),
        ...(data.professorPageId && {
          professor_page: { connect: { id: data.professorPageId } },
        }),
        ...(data.parentId && { parent_comment: { connect: { id: data.parentId } } }),
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        updated_at: true,
        user: {
          select: {
            id: true,
            name: true,
            user_type: true,
          },
        },
        course_id: true,
        professor_page_id: true,
        parent_id: true,
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
    try {
      console.log('Comment service params:', { courseId, professorPageId, parentId });

      if (professorPageId) {
        // First check if the professor page exists
        const profPage = await prisma.professorPage.findFirst({
          where: { id: professorPageId },
        });

        if (!profPage) {
          console.error(`No professor page found with ID: ${professorPageId}`);
          throw new Error(`Professor page not found with ID: ${professorPageId}`);
        }
      }

      return prisma.comment.findMany({
        where: {
          course_id: courseId,
          professor_page_id: professorPageId,
          parent_id: parentId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              user_type: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  user_type: true,
                },
              },
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error) {
      console.error('Error in getComments:', error);
      throw error;
    }
  }

  async updateComment(commentId: number, content: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: { content },
      select: {
        id: true,
        content: true,
        created_at: true,
        updated_at: true,
        user: {
          select: {
            id: true,
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