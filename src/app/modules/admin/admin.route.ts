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
  '/courses/:courseId/modules',
  validateRequest(AdminValidation.createModuleZodSchema),
  AdminController.addModule,
);
router.put(
  '/courses/:courseId/modules/:moduleId',
  validateRequest(AdminValidation.updateModuleZodSchema),
  AdminController.updateModule,
);
router.delete(
  '/courses/:courseId/modules/:moduleId',
  AdminController.deleteModule,
);
router.put(
  '/courses/:courseId/modules/reorder',
  validateRequest(AdminValidation.reorderModulesZodSchema),
  AdminController.reorderModules,
);

router.post(
  '/courses/:courseId/modules/:moduleId/lessons',
  validateRequest(AdminValidation.createLessonZodSchema),
  AdminController.addLesson,
);
router.put(
  '/courses/:courseId/modules/:moduleId/lessons/:lessonId',
  validateRequest(AdminValidation.updateLessonZodSchema),
  AdminController.updateLesson,
);
router.delete(
  '/courses/:courseId/modules/:moduleId/lessons/:lessonId',
  AdminController.deleteLesson,
);
router.put(
  '/courses/:courseId/modules/:moduleId/lessons/reorder',
  validateRequest(AdminValidation.reorderLessonsZodSchema),
  AdminController.reorderLessons,
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
router.get('/assignments', AdminController.getAssignments);
router.get('/quizzes', AdminController.getQuizzes);
router.get('/enrollments', AdminController.getAllEnrollments);

export const AdminRoutes = router;

