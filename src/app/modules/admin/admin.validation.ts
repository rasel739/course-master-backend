import z from 'zod';

const createAssignmentZodSchema = z.object({
  body: z.object({
    course: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID format'),
    module: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid module ID format'),
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description cannot exceed 2000 characters'),
  }),
});

const questionSchema = z.object({
  question: z
    .string()
    .min(5, 'Question must be at least 5 characters')
    .max(500, 'Question cannot exceed 500 characters'),
  options: z
    .array(
      z
        .string()
        .min(1, 'Option cannot be empty')
        .max(200, 'Option cannot exceed 200 characters'),
    )
    .length(4, 'Each question must have exactly 4 options'),
  correctAnswer: z
    .number()
    .int('Correct answer must be an integer')
    .min(0, 'Correct answer index must be at least 0')
    .max(3, 'Correct answer index cannot exceed 3'),
});

const createQuizZodSchema = z.object({
  body: z.object({
    course: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID format'),
    module: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid module ID format'),
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters'),
    questions: z
      .array(questionSchema)
      .min(1, 'Quiz must have at least 1 question')
      .max(50, 'Quiz cannot have more than 50 questions'),
  }),
});

export const AdminValidation = {
  createAssignmentZodSchema,
  createQuizZodSchema,
};
