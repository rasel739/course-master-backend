import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { CourseService } from './course.service';
import sendResponse from '../../../shared/sendResponse';
import { ICourse, ICourseResponse } from './course.type';

const getCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getCourse(req.query);

  sendResponse<ICourseResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getCourseById(req.params.id as string);

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

export const CourseController = {
  getCourse,
  getCourseById,
};
