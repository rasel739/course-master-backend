import httpStatus from 'http-status';
import mongoose, { Schema } from 'mongoose';
import { IQuestion, IQuiz, IQuizAttempt } from '../types';
import ApiError from '../errors/ApiErrors';
const questionSchema = new Schema<IQuestion>(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters'],
    },
    options: [
      {
        type: String,
        required: [true, 'Option is required'],
        trim: true,
        maxlength: [200, 'Option cannot exceed 200 characters'],
      },
    ],
    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer index is required'],
      min: [0, 'Answer index must be at least 0'],
      max: [3, 'Answer index cannot exceed 3'],
    },
  },
  { _id: false },
);

const quizSchema = new Schema<IQuiz>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    module: {
      type: Schema.Types.ObjectId,
      required: [true, 'Module is required'],
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    questions: {
      type: [questionSchema],
      required: [true, 'At least one question is required'],
      validate: {
        validator: function (questions: IQuestion[]) {
          return questions.length > 0 && questions.length <= 50;
        },
        message: 'Quiz must have between 1 and 50 questions',
      },
    },
    attempts: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        answers: [
          {
            type: Number,
            min: 0,
            max: 3,
          },
        ],
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        attemptedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

quizSchema.index({ course: 1, module: 1 });
quizSchema.index({ 'attempts.user': 1 });

quizSchema.virtual('totalAttempts').get(function () {
  return this.attempts.length;
});

quizSchema.virtual('averageScore').get(function () {
  if (this.attempts.length === 0) return null;

  const totalScore = this.attempts.reduce(
    (sum, attempt) => sum + attempt.score,
    0,
  );
  return Math.round(totalScore / this.attempts.length);
});

quizSchema.virtual('passRate').get(function () {
  if (this.attempts.length === 0) return null;

  const passingAttempts = this.attempts.filter(a => a.score >= 70).length;
  return Math.round((passingAttempts / this.attempts.length) * 100);
});

quizSchema.methods.calculateScore = function (answers: number[]): number {
  if (answers.length !== this.questions.length) {
    throw new Error('Number of answers must match number of questions');
  }

  let correctCount = 0;
  this.questions.forEach((question: IQuestion, index: number) => {
    if (question.correctAnswer === answers[index]) {
      correctCount++;
    }
  });

  return Math.round((correctCount / this.questions.length) * 100);
};

quizSchema.methods.hasUserAttempted = function (userId: string): boolean {
  return this.attempts.some(
    (attempt: any) => attempt.user.toString() === userId.toString(),
  );
};

quizSchema.methods.getUserBestAttempt = function (
  userId: string,
): IQuizAttempt | null {
  const userAttempts = this.attempts.filter(
    (attempt: any) => attempt.user.toString() === userId.toString(),
  );

  if (userAttempts.length === 0) return null;

  return userAttempts.reduce((best: IQuizAttempt, current: IQuizAttempt) =>
    current.score > best.score ? current : best,
  );
};

quizSchema.methods.getUserLatestAttempt = function (
  userId: string,
): IQuizAttempt | null {
  const userAttempts = this.attempts.filter(
    (attempt: any) => attempt.user.toString() === userId.toString(),
  );

  if (userAttempts.length === 0) return null;

  return userAttempts[userAttempts.length - 1];
};

quizSchema.methods.getQuestionsForStudent = function () {
  return this.questions.map((q: IQuestion) => ({
    question: q.question,
    options: q.options,
  }));
};

questionSchema.pre('validate', function () {
  if (this.options.length !== 4) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Each question must have exactly 4 options',
    );
  }
});

questionSchema.pre('validate', function () {
  if (this.correctAnswer < 0 || this.correctAnswer > 3) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Correct answer must be a valid option index (0–3)',
    );
  }
});

export default mongoose.model<IQuiz>('Quiz', quizSchema);
