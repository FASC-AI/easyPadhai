import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const submittedTestSchema = new Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    publishedDate: {
      type: Date,
    },
    publishedTime: {
      type: String,
    },
    duration: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    test: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
        answer: [],
      },
    ],
  },
  { timestamps: true }
);

const SubmitTest = model('Submittedtest', submittedTestSchema);
export default SubmitTest;
