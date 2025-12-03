import { Router } from 'express';
import { apiLimiter } from '../../../utils/rateLimiter.utils';
import { CourseController } from './course.controller';

const router = Router();

router.get('/', apiLimiter, CourseController.getCourse);
router.get('/:id', CourseController.getCourseById);

export const CourseRoutes = router;
