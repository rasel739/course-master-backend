import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../constants';
import { StudentController } from './student.controller';
import validateRequest from '../../middlewares/validateRequest';
import { StudentValidation } from './student.validation';

const router = Router();

router.use(auth(ENUM_USER_ROLE.STUDENT));

router.get('/dashboard', StudentController.getStudentDashboard);
router.post('/enroll/:courseId', StudentController.enrollCourse);
router.get(
  '/enrollments/:enrollmentId',
  StudentController.getEnrollmentDetails,
);
router.post('/progress', StudentController.markLessonComplete);
router.post(
  '/assignments/:assignmentId/submit',
  validateRequest(StudentValidation.assignmentSubmissionSchema),
  StudentController.submitAssignment,
);
router.post(
  '/quizzes/:quizId/submit',
  validateRequest(StudentValidation.quizSubmissionZodSchema),
  StudentController.submitQuiz,
);

export const StudentRoutes = router;
