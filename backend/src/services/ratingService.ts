import { PrismaClient } from '@prisma/client';

interface SubmitRatingInput {
  userId: number;
  value: number;
  professorPageId?: number;
  courseId?: number;
}

export class RatingService {
  private prisma = new PrismaClient;
  
  async getAverageRatingForProfessor(professorPageId: number): Promise<number> {
    const aggregation = await this.prisma.rating.aggregate({
      where: { professorPageId },
      _avg: { value: true },
    });
    return aggregation._avg.value || 0.0;
  }

  async getAverageRatingForCourse(courseId: number): Promise<number> {
    const aggregation = await this.prisma.rating.aggregate({
      where: { courseId },
      _avg: { value: true },
    });
    return aggregation._avg.value || 0.0;
  }

  async submitOrUpdateProfessorRating(input: SubmitRatingInput): Promise<number> {
    const { userId, value, professorPageId } = input;

    if (!professorPageId) {
      throw new Error('ProfessorPage ID is required.');
    }

    // Check if the ProfessorPage exists
    const professorPage = await this.prisma.professorPage.findUnique({
      where: { id: professorPageId },
    });

    if (!professorPage) {
      throw new Error('ProfessorPage not found.');
    }

    // Check for an existing rating by this user for the ProfessorPage
    const existingRating = await this.prisma.rating.findUnique({
      where: {
        user_professor_unique: {
          userId,
          professorPageId,
        },
      },
    });

    if (existingRating) {
      // Update the existing rating
      await this.prisma.rating.update({
        where: { id: existingRating.id },
        data: { value },
      });
    } else {
      // Create a new rating
      await this.prisma.rating.create({
        data: {
          value,
          userId,
          professorPageId,
          courseId: null,
        },
      });
    }

    // Calculate the new average rating
    const averageRating = await this.getAverageRatingForProfessor(professorPageId);

    // Update the ProfessorPage's average rating
    await this.prisma.professorPage.update({
      where: { id: professorPageId },
      data: { rating: averageRating },
    });

    return averageRating;
  }

  async submitOrUpdateCourseRating(input: SubmitRatingInput): Promise<number> {
    const { userId, value, courseId } = input;

    if (!courseId) {
      throw new Error('Course ID is required.');
    }

    // Check if the Course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error('Course not found.');
    }

    // Check for an existing rating by this user for the Course
    const existingRating = await this.prisma.rating.findUnique({
      where: {
        user_course_unique: {
          userId,
          courseId,
        },
      },
    });

    if (existingRating) {
      // Update the existing rating
      await this.prisma.rating.update({
        where: { id: existingRating.id },
        data: { value },
      });
    } else {
      // Create a new rating
      await this.prisma.rating.create({
        data: {
          value,
          userId,
          professorPageId: null,
          courseId,
        },
      });
    }

    // Calculate the new average rating
    const averageRating = await this.getAverageRatingForCourse(courseId);

    // Update the Course's average rating
    await this.prisma.course.update({
      where: { id: courseId },
      data: { rating: averageRating },
    });

    return averageRating;
  }

  async deleteRating(ratingId: number, userId: number): Promise<{ id: number } | null> {
    // Find the rating
    const rating = await this.prisma.rating.findUnique({
      where: { id: ratingId },
    });

    // Check if the rating exists and belongs to the user
    if (!rating || rating.userId !== userId) {
      return null;
    }

    // Delete the rating
    const deletedRating = await this.prisma.rating.delete({
      where: { id: ratingId },
    });

    // Recalculate and update the average rating for the associated ProfessorPage or Course
    if (deletedRating.professorPageId) {
      const newAverage = await this.getAverageRatingForProfessor(deletedRating.professorPageId);
      await this.prisma.professorPage.update({
        where: { id: deletedRating.professorPageId },
        data: { rating: newAverage },
      });
    } else if (deletedRating.courseId) {
      const newAverage = await this.getAverageRatingForCourse(deletedRating.courseId);
      await this.prisma.course.update({
        where: { id: deletedRating.courseId },
        data: { rating: newAverage },
      });
    }

    return { id: deletedRating.id };
  }
}
