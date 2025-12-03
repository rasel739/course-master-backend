import mongoose, { Model, Schema } from 'mongoose';
import { IEnrollment } from '../types';

const enrollmentSchema = new Schema<IEnrollment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: [
      {
        moduleId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        lessonId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment: Model<IEnrollment> = mongoose.model<IEnrollment>(
  'Enrollment',
  enrollmentSchema,
);

export default Enrollment;
