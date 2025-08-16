import mongoose from 'mongoose';

const lessonTestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LessonMaster',
      required: true,
    },
    test: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Test',
          required: true,
        },
        answer: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const LessonTest = mongoose.model('LessonTest', lessonTestSchema);

export default LessonTest;
