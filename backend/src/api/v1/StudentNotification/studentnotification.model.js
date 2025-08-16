import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { getFormattedCode } from '../../../utils/commonHelper';
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const studentNotificationSchema = new Schema(
  {
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'class' },
    type: { type: String, trim: true },
    message: { type: String, trim: true },
    duration: { type: String, trim: true },
    publishedTime: { type: String, trim: true },
    instructionId: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Instruction' },
    ],
    homeworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework' },
    publishedDate: { type: Date },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    isReaded: { type: Boolean, default: false },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    countRead: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

const studentNotification = model(
  'studentnotification',
  studentNotificationSchema
);

export default studentNotification;
