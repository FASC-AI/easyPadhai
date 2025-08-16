import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const offlineTestSchema = new Schema(
  {
    teacherId: { type: mongoose.Types.ObjectId, ref: 'User' },
    totalMarks: { type: String, trim: true },
    classId: { type: mongoose.Types.ObjectId, ref: 'Class' },
    subjectId: { type: mongoose.Types.ObjectId, ref: 'Subject' },
    lessonId: { type: mongoose.Types.ObjectId, ref: 'LessonMaster' },
    instructionId:[{ type: mongoose.Types.ObjectId, ref: 'Instruction'}],
    topicId: { type: mongoose.Types.ObjectId, ref: 'Lesson' },
    session: { type: String, trim: true },
    time: { type: String, trim: true },
    mcq: [{ type: mongoose.Types.ObjectId, ref: 'test' }],
    binary: [{ type: mongoose.Types.ObjectId, ref: 'test' }],
    descriptive: [{ type: mongoose.Types.ObjectId, ref: 'test' }],
  },
  {
    toJSON: { getters: true },
    timestamps: true,
  }
);

const OfflineTest = model('offlinetest', offlineTestSchema);

export default OfflineTest;
