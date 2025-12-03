import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import Course from '../course/course.model';
import { Enrollment } from '../../../models';
import User from '../auth/auth.model';
import {
  ICompletedLesson,
  IEnrollment,
  IEnrollmentPopulated,
  IMarkLessonCompleteInput,
  ISubmission,
  ISubmitAssignmentInput,
} from '../../../types';
import { Types } from 'mongoose';
import Assignment from '../../../models/Assignment';
import Quiz from '../../../models/Quiz';
import { ISubmitQuizResponse } from './student.type';

const enrollCourse = async (
  courseId: string,
  userId: string,
): Promise<IEnrollment> => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const existingEnrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
  });

  if (existingEnrollment) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Already enrolled in this course',
    );
  }

  const enrollment = await Enrollment.create({
    user: userId,
    course: courseId,
  });

  course.totalEnrollments += 1;

  await User.findByIdAndUpdate(userId, {
    $push: { enrolledCourses: courseId },
  });

  return enrollment;
};

const getStudentDashboard = async (
  userId: string,
): Promise<{ enrollments: IEnrollment[]; totalCourses: number }> => {
  const enrollments = await Enrollment.find({ user: userId })
    .populate('course', 'title thumbnail instructor category totalDuration')
    .sort('-enrolledAt')
    .lean();

  return {
    enrollments,
    totalCourses: enrollments.length,
  };
};

const getEnrollmentDetails = async (
  enrollmentId: string,
  userId: string,
): Promise<IEnrollment> => {
  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    user: userId,
  })
    .populate('course')
    .lean();

  if (!enrollment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
  }

  return enrollment;
};

const markLessonComplete = async (
  payload: IMarkLessonCompleteInput,
  userId: string,
): Promise<{ progress: number; completedLessons: number }> => {
  const { enrollmentId, moduleId, lessonId } = payload;
  const enrollment = (await Enrollment.findOne({
    _id: enrollmentId,
    user: userId,
  }).populate('course')) as IEnrollmentPopulated | null;

  if (!enrollment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
  }

  const moduleObjectId = new Types.ObjectId(moduleId);
  const lessonObjectId = new Types.ObjectId(lessonId);

  const alreadyCompleted = enrollment.completedLessons.some(
    cl =>
      cl.moduleId.equals(moduleObjectId) && cl.lessonId.equals(lessonObjectId),
  );

  if (!alreadyCompleted) {
    enrollment.completedLessons.push({
      moduleId: moduleObjectId,
      lessonId: lessonObjectId,
      completedAt: new Date(),
    });

    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );

    enrollment.progress = Math.round(
      (enrollment.completedLessons.length / totalLessons) * 100,
    );
  }

  return {
    progress: enrollment.progress,
    completedLessons: enrollment.completedLessons.length,
  };
};

const submitAssignment = async (
  payload: ISubmitAssignmentInput,
  assignmentId: string,
  userId: string,
) => {
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
  }

  const existingSubmission = assignment.submissions.find(
    sub => sub.user.toString() === userId.toString(),
  );

  if (existingSubmission) {
    existingSubmission.submissionType = payload.submissionType;
    existingSubmission.content = payload.content;
    existingSubmission.submittedAt = new Date();
  } else {
    assignment.submissions.push({
      user: new Types.ObjectId(userId),
      submissionType: payload.submissionType,
      content: payload.content,
      submittedAt: new Date(),
      _id: new Types.ObjectId(),
    });
  }

  return {
    message: 'Assignment submitted successfully',
  };
};

const submitQuiz = async (
  quizId: string,
  answers: number[],
  userId: string,
): Promise<ISubmitQuizResponse> => {
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Quiz not found');
  }

  let correctAnswers = 0;
  quiz.questions.forEach((question, index) => {
    if (question.correctAnswer === answers[index]) {
      correctAnswers++;
    }
  });

  const score = Math.round((correctAnswers / quiz.questions.length) * 100);

  quiz.attempts.push({
    user: new Types.ObjectId(userId),
    answers,
    score,
    _id: new Types.ObjectId(),
    attemptedAt: new Date(),
  });

  return {
    score,
    correctAnswers,
    totalQuestions: quiz.questions.length,
  };
};

export const StudentService = {
  enrollCourse,
  getStudentDashboard,
  getEnrollmentDetails,
  markLessonComplete,
  submitAssignment,
  submitQuiz,
};
