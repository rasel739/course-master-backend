import mongoose, { Model, Schema } from 'mongoose';
import { ICourse, ILesson, IModule } from './course.type';

const lessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

const moduleSchema = new Schema<IModule>({
  title: {
    type: String,
    required: true,
  },
  description: String,
  lessons: [lessonSchema],
  order: {
    type: Number,
    required: true,
  },
});

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development',
        'Mobile Development',
        'Data Science',
        'AI/ML',
        'DevOps',
        'Other',
      ],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    modules: [moduleSchema],
    batch: {
      number: {
        type: Number,
        default: 1,
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
    },
    totalEnrollments: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

courseSchema.virtual('totalLessons').get(function () {
  return this.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );
});

courseSchema.virtual('totalDuration').get(function () {
  return this.modules.reduce((total, module) => {
    return (
      total + module.lessons.reduce((sum, lesson) => sum + lesson.duration, 0)
    );
  }, 0);
});

courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1, price: 1 });
courseSchema.index({ createdAt: -1 });

const Course: Model<ICourse> = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
