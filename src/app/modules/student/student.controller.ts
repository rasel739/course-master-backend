import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { StudentService } from './student.service';
import sendResponse from '../../../shared/sendResponse';
import { IEnrollment } from '../../../types';

import { ISubmitQuizResponse } from './student.type';

const enrollCourse = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const { userId } = req.user as { userId: string };

  const result = await StudentService.enrollCourse(courseId, userId);

  sendResponse<IEnrollment>(res, {
    statusCode: httpStatus.OK,
    message: 'Enrolled successfully',
    success: true,
    data: result,
  });
});

const getStudentDashboard = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as { userId: string };
  const result = StudentService.getStudentDashboard(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const getEnrollmentDetails = catchAsync(async (req: Request, res: Response) => {
  const enrollmentId = req.params.enrollmentId as string;
  const { userId } = req.user as { userId: string };

  const result = await StudentService.getEnrollmentDetails(
    enrollmentId,
    userId,
  );

  sendResponse<IEnrollment>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const markLessonComplete = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as { userId: string };

  const result = await StudentService.markLessonComplete(req.body, userId);

  sendResponse<{ progress: number; completedLessons: number }>(res, {
    statusCode: httpStatus.OK,
    message: 'Lesson marked as completed',
    success: true,
    data: result,
  });
});

const submitAssignment = catchAsync(async (req: Request, res: Response) => {
  const assignmentId = req.params.assignmentId as string;
  const { userId } = req.user as { userId: string };

  const result = await StudentService.submitAssignment(
    req.body,
    assignmentId,
    userId,
  );

  sendResponse<{ message: string }>(res, {
    statusCode: httpStatus.OK,
    message: 'Assignment submitted successfully',
    success: true,
    data: result,
  });
});

const submitQuiz = catchAsync(async (req: Request, res: Response) => {
  const quizId = req.params.quizId as string;

  const { userId } = req.user as { userId: string };

  const result = await StudentService.submitQuiz(quizId, req.body, userId);

  sendResponse<ISubmitQuizResponse>(res, {
    statusCode: httpStatus.OK,
    message: 'Quiz submitted successfully',
    success: true,
    data: result,
  });
});

export const StudentController = {
  enrollCourse,
  getStudentDashboard,
  getEnrollmentDetails,
  markLessonComplete,
  submitAssignment,
  submitQuiz,
};
