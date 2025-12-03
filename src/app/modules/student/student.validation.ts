import z from 'zod';

export const assignmentSubmissionSchema = z
  .object({
    body: z.object({
      submissionType: z.enum(['link', 'text'], {
        message: 'Submission type must be either "link" or "text"',
      }),
      content: z
        .string()
        .min(1, 'Content is required')
        .max(5000, 'Content cannot exceed 5000 characters'),
    }),
  })
  .refine(
    data => {
      if (data.body.submissionType === 'link') {
        try {
          new URL(data.body.content);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Invalid URL format for link submission',
      path: ['content'],
    },
  )
  .refine(
    data => {
      if (data.body.submissionType === 'link') {
        const validDomains = [
          'drive.google.com',
          'dropbox.com',
          'github.com',
          'gitlab.com',
          'bitbucket.org',
          'onedrive.live.com',
        ];

        try {
          const url = new URL(data.body.content);
          const isValidDomain = validDomains.some(domain =>
            url.hostname.includes(domain),
          );

          return isValidDomain;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message:
        'Link must be from Google Drive, Dropbox, GitHub, GitLab, Bitbucket, or OneDrive',
      path: ['content'],
    },
  );

const quizSubmissionZodSchema = z.object({
  body: z.object({
    answers: z
      .array(
        z
          .number()
          .int('Answer must be an integer')
          .min(0, 'Answer index must be at least 0')
          .max(3, 'Answer index cannot exceed 3'),
      )
      .min(1, 'At least one answer is required')
      .max(50, 'Cannot submit more than 50 answers'),
  }),
});

export const StudentValidation = {
  quizSubmissionZodSchema,
  assignmentSubmissionSchema,
};
