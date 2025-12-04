import {
  IAssignment,
  IEnrollment,
  IQuiz,
  ISubmission,
} from './../../../types/index';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import { deleteCachePattern } from '../../../utils/cache.utils';
import Course from '../course/course.model';
import { ICourse } from '../course/course.type';
import { Enrollment } from '../../../models';
import {
  IAnalyticsParams,
  IAnalyticsResult,
  IEnrollmentResponse,
} from './admin.type';
import {
  IGradeBody,
  IGradeParams,
  IPaginationQuery,
} from '../admin/admin.type';
import Assignment from '../../../models/Assignment';
import { Types } from 'mongoose';
import Quiz from '../../../models/Quiz';

const createCourse = async (payload: ICourse): Promise<ICourse> => {
  const course = await Course.create(payload);

  await deleteCachePattern('courses:*');

  return course;
};

const updateCourse = async (
  id: string,
  payload: Partial<ICourse>,
): Promise<ICourse> => {
  const course = await Course.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  await deleteCachePattern('courses:*');

  return course;
};

const deleteCourse = async (id: string) => {
  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  await Enrollment.deleteMany({ course: id });

  await deleteCachePattern('courses:*');

  return {
    message: 'Course deleted successfully',
  };
};

const getCourseEnrollments = async (
  courseId: string,
  payload: IPaginationQuery,
): Promise<IEnrollmentResponse> => {
  const { page, limit } = payload;

  const pageNum = page || 1;
  const limitNum = limit || 20;
  const skip = (pageNum - 1) * limitNum;

  const [enrollments, total] = await Promise.all([
    Enrollment.find({ course: courseId })
      .populate('user', 'name email')
      .sort('-enrolledAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Enrollment.countDocuments({ course: courseId }),
  ]);

  return {
    enrollments,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalEnrollments: total,
    },
  };
};

const getAssignmentSubmissions = async (
  assignmentId: string,
): Promise<{ assignment: IAssignment; totalSubmissions: number }> => {
  const assignment = await Assignment.findById(assignmentId)
    .populate('submissions.user', 'name email')
    .lean();

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
  }

  return {
    assignment,
    totalSubmissions: assignment.submissions.length,
  };
};

const gradeAssignment = async (
  payload: IGradeParams & IGradeBody,
): Promise<ISubmission> => {
  const { assignmentId, submissionId, grade, feedback } = payload;

  if (!grade && grade !== 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Grade is required');
  }

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
  }

  const submissionObjectId = new Types.ObjectId(submissionId);

  const submission = assignment.submissions.find(submission =>
    submission._id.equals(submissionObjectId),
  );

  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Submission not found');
  }

  submission.grade = grade;
  submission.feedback = feedback ?? '';

  return submission;
};

const createAssignment = async (payload: IAssignment): Promise<IAssignment> => {
  const assignment = await Assignment.create(payload);

  return assignment;
};

const createQuiz = async (payload: IQuiz): Promise<IQuiz> => {
  const quiz = await Quiz.create(payload);

  return quiz;
};

const getAnalytics = async (
  params: IAnalyticsParams,
): Promise<IAnalyticsResult> => {
  const { startDate, endDate } = params;

  const dateFilter: { $gte?: Date; $lte?: Date } = {};

  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const query =
    dateFilter.$gte || dateFilter.$lte ? { enrolledAt: dateFilter } : {};

  const enrollmentStats = await Enrollment.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          year: { $year: '$enrolledAt' },
          month: { $month: '$enrolledAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const courseStats = await Course.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        totalEnrollments: { $sum: '$totalEnrollments' },
      },
    },
  ]);

  const [totalCourses, totalEnrollments, totalStudents] = await Promise.all([
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Enrollment.distinct('user').then(users => users.length),
  ]);

  return {
    overview: {
      totalCourses,
      totalEnrollments,
      totalStudents,
    },
    enrollmentTrends: enrollmentStats,
    coursesByCategory: courseStats,
  };
};

export const AdminService = {
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
