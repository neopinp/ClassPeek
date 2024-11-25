import { PrismaClient } from '@prisma/client';

export class FileService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient
  }

  async createFile({
    title,
    content,
    user_id,
  }: {
    title: string;
    content: Object;
    user_id: number;
  }) {
    try {
      return await this.prisma.file.create({
        data: {
          title:title,
          content:JSON.stringify(content),
          user_id: user_id,
        },
      });
    } catch (error) {
      console.error("Error creating file:", error);
      throw new Error("Failed to create file");
    }
  }

  async getFiles({
    user_id
  }: {
    user_id: number;
  }) {
    try {
      return await this.prisma.file.findMany({
        where: {user_id: user_id},
      });
    } catch (error) {
      console.error("Error fetching files", error);
      throw new Error("Failed to fetch files");
    }
  }

  async getFile({
    user_id,
    title,
  }: {
    user_id: number;
    title: string;
  }) {
    try {
      return await this.prisma.file.findUnique({
        where: {user_id: user_id, title: title},
      });
    } catch (error) {
      console.error("Error fetching file", error);
      throw new Error("Failed to fetch file");
    }
  }

  async updateFile(user_id: number, title: string, content: Object) {
    try {
    return await this.prisma.file.update({
        where: { user_id: user_id, title:title },
        data: { content: JSON.stringify(content) },
    });
    } catch (error) {
    console.error("Error updating comment:", error);
    throw new Error("Failed to update comment");
    }
}

  async deleteFile(user_id: number, title: string) {
    try {
      return await this.prisma.file.delete({
        where: { user_id: user_id, title:title },
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("Failed to delete file");
    }
  }

}