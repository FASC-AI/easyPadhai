import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { getFormattedCodee } from '../../../utils/commonHelper.js';
import { updateTestReferences } from '../Test/test.controller.js';
import { updateInstructionReferences } from '../Instruction/Instruction.controller.js';
const { Schema, model } = mongoose;
import AutoIncrement from 'mongoose-sequence';

const classSchema = new Schema(
  {
    classCode: {
      type: Number,
      unique: true,

      trim: true,
      get: (val) => getFormattedCodee('CLS', val),
    },
    nameEn: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
    },
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

// Pre-save hook to auto-increment classCode
classSchema.pre('save', async function (next) {
  if (!this.isNew || typeof this.classCode === 'number') {
    return next();
  }

  try {
    const lastClass = await mongoose
      .model('Class')
      .findOne()
      .sort({ classCode: -1 });
    this.classCode =
      lastClass && lastClass.classCode ? lastClass.classCode + 1 : 1;
    next();
  } catch (error) {
    next(error);
  }
});

// Add this to your Class schema (classSchema)
classSchema.post('findOneAndUpdate', async function (result) {
  try {
    // 'this' refers to the query object
    const doc = await this.model.findOne(this.getQuery());

    if (doc && this.getUpdate().$set?.nameEn) {
      const newName = this.getUpdate().$set.nameEn;
      console.log(`Class name updated via findByIdAndUpdate to: ${newName}`);
      await updateTestReferences('Class', doc._id, newName);
      await updateInstructionReferences('Class', doc._id, newName);
    }
  } catch (error) {
    console.error('Error in findOneAndUpdate hook:', error);
  }
});

classSchema.plugin(AutoIncrement(mongoose), { inc_field: 'classCode', id: 'class' });
const Class = model('Class', classSchema);

export default Class;
