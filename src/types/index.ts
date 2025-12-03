import { Types } from 'mongoose';
import { IUser } from '../app/modules/auth/auth.type';
import { ICourse } from '../app/modules/course/course.type';

export interface ICompletedLesson {
  moduleId: Types.ObjectId;
  lessonId: Types.ObjectId;
  completedAt: Date;
}

export interface IMarkLessonCompleteInput {
  enrollmentId: string;
  moduleId: string;
  lessonId: string;
}

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  course: Types.ObjectId | ICourse;
  progress: number;
  completedLessons: ICompletedLesson[];
  enrolledAt: Date;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmission {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  submissionType: 'link' | 'text';
  content: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
}

export interface ISubmitAssignmentInput {
  submissionType: 'link' | 'text';
  content: string;
}

export interface IAssignment extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId | ICourse;
  module: Types.ObjectId;
  title: string;
  description: string;
  submissions: ISubmission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface IQuizAttempt {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  answers: number[];
  score: number;
  attemptedAt: Date;
}

export interface IQuiz extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId | ICourse;
  module: Types.ObjectId;
  title: string;
  questions: IQuestion[];
  attempts: IQuizAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollmentPopulated extends Omit<IEnrollment, 'course'> {
  course: ICourse;
}
