import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import { getCache, setCache } from '../../../utils/cache.utils';
import Course from './course.model';
import { ICourse, ICourseQuery, ICourseResponse } from './course.type';

export const getCourse = async (
  payload: ICourseQuery,
): Promise<ICourseResponse> => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    tags,
    sortBy = 'createdAt',
    order = 'desc',
    minPrice,
    maxPrice,
  } = payload;

  const cacheKey = `courses:${JSON.stringify(payload)}`;

  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return {
      ...cachedData,
      cached: true,
    };
  }

  const query: any = { isPublished: true };

  if (search) {
    query.$text = { $search: search };
  }

  if (category) {
    query.category = category;
  }

  let tagArray: string[] = [];

  if (typeof tags === 'string') {
    tagArray = tags.split(',').map(t => t.trim());
  } else if (Array.isArray(tags)) {
    tagArray = tags.map(t => t.trim());
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortOptions: Record<string, 1 | -1> = {
    [sortBy]: order === 'asc' ? 1 : -1,
  };

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const [courses, total] = await Promise.all([
    Course.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
    Course.countDocuments(query),
  ]);

  const result: ICourseResponse = {
    courses,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalCourses: total,
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
  };

  await setCache(cacheKey, result, 300);

  return result;
};

const getCourseById = async (id: string): Promise<ICourse> => {
  const course = await Course.findById(id).lean();

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return course;
};

export const CourseService = {
  getCourse,
  getCourseById,
};
