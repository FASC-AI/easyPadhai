import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);
import uniqueValidator from 'mongoose-unique-validator';
import { getFormattedCodee } from '../../../utils/commonHelper';
import { updateTestReferences } from '../Test/test.controller';
const { Schema, model } = mongoose;

const bookSchema = new Schema(
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

    isActive: {
      type: Boolean,
      default: true,
    },
    bookCode: {
      type: Number,
      unique: true,

      trim: true,
      get: (val) => getFormattedCodee('BNK', val),
    },
    images: [
      {
        url: { type: String },
        name: { type: String },
      },
    ],
    description: { type: String },
    nameEn: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookSchema.pre('save', async function (next) {
  if (!this.isNew || typeof this.bookCode === 'number') {
    return next();
  }

  try {
    const lastBook = await mongoose
      .model('Book')
      .findOne()
      .sort({ bookCode: -1 });
    this.bookCode = lastBook && lastBook.bookCode ? lastBook.bookCode + 1 : 1;
    next();
  } catch (error) {
    next(error);
  }
});

bookSchema.post('findOneAndUpdate', async function (result) {
  try {
    // 'this' refers to the query object
    const doc = await this.model.findOne(this.getQuery());

    if (doc && this.getUpdate().$set?.nameEn) {
      const newName = this.getUpdate().$set.nameEn;
      console.log(`bookCode name updated via findByIdAndUpdate to: ${newName}`);
      await updateTestReferences('Book', doc._id, newName);
    }
  } catch (error) {
    console.error('Error in findOneAndUpdate hook:', error);
  }
});

bookSchema.plugin(AutoIncrement, { inc_field: 'bookCode', id: 'book' });

const Book = model('Book', bookSchema);

export default Book;
