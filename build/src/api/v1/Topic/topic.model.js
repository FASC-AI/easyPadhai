import mongoose from 'mongoose';

const lessonTopicStatusSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LessonMaster',
    required: true,
  }, // Lesson _id or name
  lesson: { type: String, required: true }, // Lesson name (from nameEn or lesson)
  status: { type: Boolean, default: false }, // Lesson status
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  topics: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Lesson',
      }, // Topic _id

      topic: { type: String, required: true }, // Topic name
      status: { type: Boolean, default: false }, // Topic status
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

lessonTopicStatusSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const LessonTopicStatus = mongoose.model(
  'LessonTopicStatus',
  lessonTopicStatusSchema
);

export default LessonTopicStatus;
