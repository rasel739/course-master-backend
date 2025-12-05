import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { AdminService } from './admin.service';
import { ICourse } from '../course/course.type';
import sendResponse from '../../../shared/sendResponse';
import {
  IAnalyticsResult,
  IEnrollmentResponse,
  IAssignmentsResponse,
  IQuizzesResponse,
  IAllEnrollmentsResponse,
} from './admin.type';
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

const getAssignments = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAssignments(req.query);

  sendResponse<IAssignmentsResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const getQuizzes = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getQuizzes(req.query);

  sendResponse<IQuizzesResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const getAllEnrollments = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllEnrollments(req.query);

  sendResponse<IAllEnrollmentsResponse>(res, {
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
  const result = await AdminService.getAnalytics(req.query);

  sendResponse<IAnalyticsResult>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const addModule = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const result = await AdminService.addModule(courseId, req.body);

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.CREATED,
    message: 'Module added successfully',
    success: true,
    data: result,
  });
});

const updateModule = catchAsync(async (req: Request, res: Response) => {
  const { courseId, moduleId } = req.params as {
    courseId: string;
    moduleId: string;
  };
  const result = await AdminService.updateModule(courseId, moduleId, req.body);

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    message: 'Module updated successfully',
    success: true,
    data: result,
  });
});

const deleteModule = catchAsync(async (req: Request, res: Response) => {
  const { courseId, moduleId } = req.params as {
    courseId: string;
    moduleId: string;
  };
  const result = await AdminService.deleteModule(courseId, moduleId);

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    message: 'Module deleted successfully',
    success: true,
    data: result,
  });
});

const reorderModules = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const result = await AdminService.reorderModules(
    courseId,
    req.body.moduleOrders,
  );

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    message: 'Modules reordered successfully',
    success: true,
    data: result,
  });
});

const addLesson = catchAsync(async (req: Request, res: Response) => {
  const { courseId, moduleId } = req.params as {
    courseId: string;
    moduleId: string;
  };
  const result = await AdminService.addLesson(courseId, moduleId, req.body);

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.CREATED,
    message: 'Lesson added successfully',
    success: true,
    data: result,
  });
});

const updateLesson = catchAsync(async (req: Request, res: Response) => {
  const { courseId, moduleId, lessonId } = req.params as {
    courseId: string;
    moduleId: string;
    lessonId: string;
  };
  const result = await AdminService.updateLesson(
    courseId,
    moduleId,
    lessonId,
    req.body,
  );

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    message: 'Lesson updated successfully',
    success: true,
    data: result,
  });
});

const deleteLesson = catchAsync(async (req: Request, res: Response) => {
  const { courseId, moduleId, lessonId } = req.params as {
    courseId: string;
    moduleId: string;
    lessonId: string;
  };
  const result = await AdminService.deleteLesson(courseId, moduleId, lessonId);

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    message: 'Lesson deleted successfully',
    success: true,
    data: result,
  });
});

const reorderLessons = catchAsync(async (req: Request, res: Response) => {
  const { courseId, moduleId } = req.params as {
    courseId: string;
    moduleId: string;
  };
  const result = await AdminService.reorderLessons(
    courseId,
    moduleId,
    req.body.lessonOrders,
  );

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    message: 'Lessons reordered successfully',
    success: true,
    data: result,
  });
});

export const AdminController = {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseEnrollments,
  getAssignments,
  getQuizzes,
  getAllEnrollments,
  getAssignmentSubmissions,
  gradeAssignment,
  createAssignment,
  createQuiz,
  getAnalytics,

  addModule,
  updateModule,
  deleteModule,
  reorderModules,

  addLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
};

