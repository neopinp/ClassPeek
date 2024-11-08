export interface CommentData {
    id: number;
    content: string;
    userId: number;
    courseId?: number;
    professorPageId?: number;
    parentId?: number;
    createdAt: string | Date;
    updatedAt: string | Date;
    user: {
      name: string;
      userType: 'STUDENT' | 'PROFESSOR';
    };
    replies?: CommentData[];
  }
  
  export interface CommentProps {
    courseId?: number;
    professorPageId?: number;
  }