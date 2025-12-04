import z from 'zod';

const courseZodSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
    instructor: z.string().min(2).max(100),
    category: z.enum([
      'Web Development',
      'Mobile Development',
      'Data Science',
      'AI/ML',
      'DevOps',
      'Other',
    ]),
    tags: z.array(z.string()).optional(),
    price: z.number().min(0),
    thumbnail: z.string().optional().nullable(),
    modules: z
      .array(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          order: z.number(),
          lessons: z.array(
            z.object({
              title: z.string().min(1),
              videoUrl: z.string().url(),
              duration: z.number().min(1),
              order: z.number(),
            }),
          ),
        }),
      )
      .optional(),
  }),
});

export const CourseValidation = {
  courseZodSchema,
};
