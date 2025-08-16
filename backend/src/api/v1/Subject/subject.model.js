import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { getFormattedCodee } from '../../../utils/commonHelper';
import { updateTestReferences } from '../Test/test.controller';
import { updateInstructionReferences } from '../Instruction/Instruction.controller';

const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const subjectSchema = new Schema(
  {
    subjectCode: {
      type: Number,
      unique: true,
      trim: true,
      get: (val) => getFormattedCodee('SUB', val),
    },
    nameEn: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
    },
    images: [
      {
        url: { type: String },
        name: { type: String },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Pre-save hook to auto-increment subjectCode
subjectSchema.pre('save', async function (next) {
  if (!this.isNew || typeof this.subjectCode === 'number') {
    return next();
  }

  try {
    const lastSubject = await mongoose
      .model('Subject')
      .findOne()
      .sort({ subjectCode: -1 });
    this.subjectCode =
      lastSubject && lastSubject.subjectCode ? lastSubject.subjectCode + 1 : 1;
    next();
  } catch (error) {
    next(error);
  }
});

subjectSchema.post('findOneAndUpdate', async function (result) {
  try {
    // 'this' refers to the query object
    const doc = await this.model.findOne(this.getQuery());

    if (doc && this.getUpdate().$set?.nameEn) {
      const newName = this.getUpdate().$set.nameEn;
      console.log(`Subject name updated via findByIdAndUpdate to: ${newName}`);
      await updateTestReferences('Subject', doc._id, newName);
      await updateInstructionReferences('Subject', doc._id, newName);
    }
  } catch (error) {
    console.error('Error in findOneAndUpdate hook:', error);
  }
});

subjectSchema.plugin(uniqueValidator);
subjectSchema.plugin(AutoIncrement, {
  inc_field: 'subjectCode',
  id: 'subject',
});

const Subject = model('Subject', subjectSchema);
export default Subject;
