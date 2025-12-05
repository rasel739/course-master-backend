import { IEnrollment } from '../../../types';

export interface IEnrollmentResponse {
  enrollments: IEnrollment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEnrollments: number;
  };
}

export interface IGradeParams {
  assignmentId: string;
  submissionId: string;
}

export interface IGradeBody {
  grade: number;
  feedback?: string;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
}

export interface IAnalyticsParams {
  startDate?: string;
  endDate?: string;
}

export interface IEnrollmentTrend {
  _id: { year: number; month: number };
  count: number;
}

export interface ICoursesByCategory {
  _id: string;
  count: number;
  avgPrice: number;
  totalEnrollments: number;
}

export interface IAnalyticsResult {
  overview: {
    totalCourses: number;
    totalEnrollments: number;
    totalStudents: number;
  };
  enrollmentTrends: IEnrollmentTrend[];
  coursesByCategory: ICoursesByCategory[];
}

export interface IAssignmentsResponse {
  assignments: import('../../../types').IAssignment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalAssignments: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IQuizzesResponse {
  quizzes: import('../../../types').IQuiz[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalQuizzes: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IAllEnrollmentsResponse {
  enrollments: import('../../../types').IEnrollment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEnrollments: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

