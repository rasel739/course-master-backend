import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../constants';
import validateRequest from '../../middlewares/validateRequest';
import { CourseValidation } from '../course/course.validation';
import { AdminController } from './admin.controller';
import { AdminValidation } from './admin.validation';
const router = Router();

router.use(auth(ENUM_USER_ROLE.ADMIN));

router.post(
  '/courses',
  validateRequest(CourseValidation.courseZodSchema),
  AdminController.createCourse,
);
router.put(
  '/courses/:id',
  validateRequest(CourseValidation.courseZodSchema),
  AdminController.updateCourse,
);
router.delete('/courses/:id', AdminController.deleteCourse);

router.get(
  '/courses/:courseId/enrollments',
  AdminController.getCourseEnrollments,
);

router.post(
  '/assignments',
  validateRequest(AdminValidation.createAssignmentZodSchema),
  AdminController.createAssignment,
);
router.get(
  '/assignments/:assignmentId/submissions',
  AdminController.getAssignmentSubmissions,
);
router.put(
  '/assignments/:assignmentId/submissions/:submissionId/grade',
  AdminController.gradeAssignment,
);

router.post(
  '/quizzes',
  validateRequest(AdminValidation.createQuizZodSchema),
  AdminController.createQuiz,
);

router.get('/analytics', AdminController.getAnalytics);

export const AdminRoutes = router;
