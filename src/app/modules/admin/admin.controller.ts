import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { AdminService } from './admin.service';
import { ICourse } from '../course/course.type';
import sendResponse from '../../../shared/sendResponse';
import { IAnalyticsResult, IEnrollmentResponse } from './admin.type';
import { IAssignment, IQuiz, ISubmission } from '../../../types';
import { IGradeBody, IGradeParams } from '../admin/admin.type';

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createCourse(req.body);

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.CREATED,
    message: 'Course created successfully',
    success: true,
    data: result,
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await AdminService.updateCourse(id, req.body);

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    message: 'Course updated successfully',
    success: true,
    data: result,
  });
});

const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.deleteCourse(req.params.id as string);

  sendResponse<{ message: string }>(res, {
    statusCode: httpStatus.OK,
    message: 'Course deleted successfully',
    success: true,
    data: result,
  });
});

const getCourseEnrollments = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const result = await AdminService.getCourseEnrollments(courseId, req.query);

  sendResponse<IEnrollmentResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const getAssignmentSubmissions = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.getAssignmentSubmissions(
      req.params.assignmentId as string,
    );

    sendResponse<{ assignment: IAssignment; totalSubmissions: number }>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
    });
  },
);

const gradeAssignment = catchAsync(async (req: Request, res: Response) => {
  const gradeRequest = req as unknown as IGradeParams & IGradeBody;

  const result = await AdminService.gradeAssignment(gradeRequest);

  sendResponse<ISubmission>(res, {
    statusCode: httpStatus.OK,
    message: 'Assignment graded successfully',
    success: true,
    data: result,
  });
});

const createAssignment = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createAssignment(req.body);

  sendResponse<IAssignment>(res, {
    statusCode: httpStatus.CREATED,
    message: 'Assignment created successfully',
    success: true,
    data: result,
  });
});

const createQuiz = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createQuiz(req.body);

  sendResponse<IQuiz>(res, {
    statusCode: httpStatus.CREATED,
    message: 'Quiz created successfully',
    success: true,
    data: result,
  });
});

const getAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAnalytics(req.params);

  sendResponse<IAnalyticsResult>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

export const AdminController = {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseEnrollments,
  getAssignmentSubmissions,
  gradeAssignment,
  createAssignment,
  createQuiz,
  getAnalytics,
};
