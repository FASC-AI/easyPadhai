import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { getFormattedCodee } from '../../../utils/commonHelper.js';

const { Schema, model } = mongoose;
import AutoIncrement from 'mongoose-sequence';

const sectionSchema = new Schema(
  {
    sectionCode: {
      type: Number,
      unique: true,
      trim: true,
      get: (val) => getFormattedCodee('SEC', val),
    },
    description: { type: String },
    sectionsName: { type: String },
    order: {
      type: Number,
    },

    isActive: {
      type: Boolean,
    },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

sectionSchema.pre('save', async function (next) {
  if (!this.isNew || typeof this.sectionCode === 'number') {
    return next();
  }

  try {
    const lastSubject = await mongoose
      .model('Section')
      .findOne()
      .sort({ sectionCode: -1 });
    this.sectionCode =
      lastSubject && lastSubject.sectionCode ? lastSubject.sectionCode + 1 : 1;
    next();
  } catch (error) {
    next(error);
  }
});
sectionSchema.plugin(uniqueValidator);
sectionSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'sectionCode',
  id: 'section',
});
const Section = model('Section', sectionSchema);
export default Section;
