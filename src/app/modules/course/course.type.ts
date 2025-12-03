import { Document, Types } from 'mongoose';

type CourseCategoryType =
  | 'Web Development'
  | 'Mobile Development'
  | 'Data Science'
  | 'AI/ML'
  | 'DevOps'
  | 'Other';

export interface ILesson {
  _id: Types.ObjectId;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
}

export interface IModule {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  lessons: ILesson[];
  order: number;
}

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  instructor: string;
  category: CourseCategoryType;
  tags: string[];
  price: number;
  thumbnail?: string;
  modules: IModule[];
  batch: {
    number: number;
    startDate: Date;
  };
  totalEnrollments: number;
  isPublished: boolean;
  totalLessons?: number;
  totalDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tags?: string | string[];
  sortBy?: string;
  order?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface ICourseResponse {
  courses: ICourse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  cached?: boolean;
}
