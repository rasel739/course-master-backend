import { IAssignment, IQuiz, ISubmission } from './../../../types/index';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import { deleteCachePattern } from '../../../utils/cache.utils';
import Course from '../course/course.model';
import { ICourse, ILesson, IModule } from '../course/course.type';
import { Enrollment } from '../../../models';
import {
  IAnalyticsParams,
  IAnalyticsResult,
  IEnrollmentResponse,
  IAssignmentsResponse,
  IQuizzesResponse,
  IAllEnrollmentsResponse,
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

const getAssignments = async (
  payload: IPaginationQuery,
): Promise<IAssignmentsResponse> => {
  const { page, limit } = payload;

  const pageNum = page || 1;
  const limitNum = limit || 20;
  const skip = (pageNum - 1) * limitNum;

  const [assignments, total] = await Promise.all([
    Assignment.find()
      .populate('course', 'title')
      .populate('submissions.user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Assignment.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    assignments,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalAssignments: total,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
  };
};

const getQuizzes = async (
  payload: IPaginationQuery,
): Promise<IQuizzesResponse> => {
  const { page, limit } = payload;

  const pageNum = page || 1;
  const limitNum = limit || 20;
  const skip = (pageNum - 1) * limitNum;

  const [quizzes, total] = await Promise.all([
    Quiz.find()
      .populate('course', 'title')
      .populate('attempts.user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Quiz.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    quizzes,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalQuizzes: total,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
  };
};

const getAllEnrollments = async (
  payload: IPaginationQuery,
): Promise<IAllEnrollmentsResponse> => {
  const { page, limit } = payload;

  const pageNum = page || 1;
  const limitNum = limit || 20;
  const skip = (pageNum - 1) * limitNum;

  const [enrollments, total] = await Promise.all([
    Enrollment.find()
      .populate('user', 'name email avatar')
      .populate('course', 'title category')
      .sort('-enrolledAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Enrollment.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    enrollments,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalEnrollments: total,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
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

const addModule = async (
  courseId: string,
  moduleData: Partial<IModule>,
): Promise<ICourse> => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const maxOrder = course.modules.reduce((max, m) => Math.max(max, m.order), 0);

  const newModule = {
    _id: new Types.ObjectId(),
    title: moduleData.title!,
    description: moduleData.description,
    lessons: [],
    order: moduleData.order ?? maxOrder + 1,
  };

  course.modules.push(newModule as IModule);
  await course.save();

  await deleteCachePattern('courses:*');

  return course;
};

const updateModule = async (
  courseId: string,
  moduleId: string,
  moduleData: Partial<IModule>,
): Promise<ICourse> => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const moduleObjectId = new Types.ObjectId(moduleId);
  const module = course.modules.find(m => m._id.equals(moduleObjectId));

  if (!module) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');
  }

  if (moduleData.title) module.title = moduleData.title;
  if (moduleData.description !== undefined)
    module.description = moduleData.description;
  if (moduleData.order !== undefined) module.order = moduleData.order;

  await course.save();
  await deleteCachePattern('courses:*');

  return course;
};

const deleteModule = async (
  courseId: string,
  moduleId: string,
): Promise<ICourse> => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const moduleObjectId = new Types.ObjectId(moduleId);
  const moduleIndex = course.modules.findIndex(m =>
    m._id.equals(moduleObjectId),
  );

  if (moduleIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');
  }

  course.modules.splice(moduleIndex, 1);
  await course.save();

  await deleteCachePattern('courses:*');

  return course;
};

const reorderModules = async (
  courseId: string,
  moduleOrders: { moduleId: string; order: number }[],
): Promise<ICourse> => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  moduleOrders.forEach(({ moduleId, order }) => {
    const moduleObjectId = new Types.ObjectId(moduleId);
    const module = course.modules.find(m => m._id.equals(moduleObjectId));
    if (module) {
      module.order = order;
    }
  });

  course.modules.sort((a, b) => a.order - b.order);
  await course.save();

  await deleteCachePattern('courses:*');

  return course;
};

const addLesson = async (
  courseId: string,
  moduleId: string,
  lessonData: Partial<ILesson>,
): Promise<ICourse> => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const moduleObjectId = new Types.ObjectId(moduleId);
  const module = course.modules.find(m => m._id.equals(moduleObjectId));

  if (!module) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');
  }

  const maxOrder = module.lessons.reduce((max, l) => Math.max(max, l.order), 0);

  const newLesson = {
    _id: new Types.ObjectId(),
    title: lessonData.title!,
    videoUrl: lessonData.videoUrl!,
    duration: lessonData.duration!,
    order: lessonData.order ?? maxOrder + 1,
  };

  module.lessons.push(newLesson as ILesson);
  await course.save();

  await deleteCachePattern('courses:*');

  return course;
};

const updateLesson = async (
  courseId: string,
  moduleId: string,
  lessonId: string,
  lessonData: Partial<ILesson>,
): Promise<ICourse> => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const moduleObjectId = new Types.ObjectId(moduleId);
  const module = course.modules.find(m => m._id.equals(moduleObjectId));

  if (!module) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');
  }

  const lessonObjectId = new Types.ObjectId(lessonId);
  const lesson = module.lessons.find(l => l._id.equals(lessonObjectId));

  if (!lesson) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lesson not found');
  }

  if (lessonData.title) lesson.title = lessonData.title;
  if (lessonData.videoUrl) lesson.videoUrl = lessonData.videoUrl;
  if (lessonData.duration) lesson.duration = lessonData.duration;
  if (lessonData.order !== undefined) lesson.order = lessonData.order;

  await course.save();
  await deleteCachePattern('courses:*');

  return course;
};

const deleteLesson = async (
  courseId: string,
  moduleId: string,
  lessonId: string,
): Promise<ICourse> => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const moduleObjectId = new Types.ObjectId(moduleId);
  const module = course.modules.find(m => m._id.equals(moduleObjectId));

  if (!module) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');
  }

  const lessonObjectId = new Types.ObjectId(lessonId);
  const lessonIndex = module.lessons.findIndex(l =>
    l._id.equals(lessonObjectId),
  );

  if (lessonIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lesson not found');
  }

  module.lessons.splice(lessonIndex, 1);
  await course.save();

  await deleteCachePattern('courses:*');

  return course;
};

const reorderLessons = async (
  courseId: string,
  moduleId: string,
  lessonOrders: { lessonId: string; order: number }[],
): Promise<ICourse> => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const moduleObjectId = new Types.ObjectId(moduleId);
  const module = course.modules.find(m => m._id.equals(moduleObjectId));

  if (!module) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');
  }

  lessonOrders.forEach(({ lessonId, order }) => {
    const lessonObjectId = new Types.ObjectId(lessonId);
    const lesson = module.lessons.find(l => l._id.equals(lessonObjectId));
    if (lesson) {
      lesson.order = order;
    }
  });

  module.lessons.sort((a, b) => a.order - b.order);
  await course.save();

  await deleteCachePattern('courses:*');

  return course;
};

export const AdminService = {
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

