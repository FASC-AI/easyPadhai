import mongoose from 'mongoose';

import uniqueValidator from 'mongoose-unique-validator';

const AutoIncrement = require('mongoose-sequence')(mongoose);
import { getFormattedCodee } from '../../../utils/commonHelper';
import { updateTestReferences } from '../Test/test.controller';
const { Schema, model } = mongoose;

const lessonMaster = new Schema(
  {
    subjectId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
      },
    ],
    classId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
      },
    ],
    bookId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
    ],

    isActive: {
      type: Boolean,
    },
    description: { type: String },
    lessonCode: {
      type: Number,
      unique: true,

      trim: true,
      get: (val) => getFormattedCodee('LESS', val),
    },
    order: {
      type: Number,
    },
    nameEn: {
      type: String,
      required: [true, 'Lesson name is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

lessonMaster.pre('save', async function (next) {
  if (!this.isNew || typeof this.lessonCode === 'number') {
    return next();
  }

  try {
    const lastLesson = await mongoose
      .model('LessonMaster')
      .findOne()
      .sort({ lessonCode: -1 });
    this.lessonCode =
      lastLesson && lastLesson.lessonCode ? lastLesson.lessonCode + 1 : 1;
    next();
  } catch (error) {
    next(error);
  }
});

lessonMaster.post('findOneAndUpdate', async function (result) {
  try {
    // 'this' refers to the query object
    const doc = await this.model.findOne(this.getQuery());

    if (doc && this.getUpdate().$set?.nameEn) {
      const newName = this.getUpdate().$set.nameEn;
      console.log(
        `LessonMaster name updated via findByIdAndUpdate to: ${newName}`
      );
      await updateTestReferences('LessonMaster', doc._id, newName);
    }
  } catch (error) {
    console.error('Error in findOneAndUpdate hook:', error);
  }
});

lessonMaster.plugin(AutoIncrement, { inc_field: 'lessonCode', id: 'lesson' });
const LessonMaster = model('LessonMaster', lessonMaster);

export default LessonMaster;
