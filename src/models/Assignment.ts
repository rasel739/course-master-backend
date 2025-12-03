import mongoose, { Model, Schema } from 'mongoose';
import { IAssignment, ISubmission } from '../types';

const assignmentSchema = new Schema<IAssignment>(
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
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    submissions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        submissionType: {
          type: String,
          enum: ['link', 'text'],
          default: 'text',
          required: true,
        },
        content: {
          type: String,
          required: [true, 'Submission content is required'],
          maxlength: [5000, 'Content cannot exceed 5000 characters'],
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        grade: {
          type: Number,
          min: [0, 'Grade cannot be negative'],
          max: [100, 'Grade cannot exceed 100'],
        },
        feedback: {
          type: String,
          maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

assignmentSchema.index({ course: 1, module: 1 });
assignmentSchema.index({ 'submissions.user': 1 });

assignmentSchema.virtual('totalSubmissions').get(function () {
  return this.submissions.length;
});

assignmentSchema.virtual('averageGrade').get(function () {
  const gradedSubmissions = this.submissions.filter(s => s.grade !== undefined);
  if (gradedSubmissions.length === 0) return null;

  const totalGrade = gradedSubmissions.reduce(
    (sum, s) => sum + (s.grade || 0),
    0,
  );
  return Math.round(totalGrade / gradedSubmissions.length);
});

assignmentSchema.methods.hasUserSubmitted = function (userId: string): boolean {
  return this.submissions.some(
    (sub: any) => sub.user.toString() === userId.toString(),
  );
};

assignmentSchema.methods.getUserSubmission = function (
  userId: string,
): ISubmission | null {
  return (
    this.submissions.find(
      (sub: any) => sub.user.toString() === userId.toString(),
    ) || null
  );
};

const Assignment: Model<IAssignment> = mongoose.model<IAssignment>(
  'Assignment',
  assignmentSchema,
);

export default Assignment;
