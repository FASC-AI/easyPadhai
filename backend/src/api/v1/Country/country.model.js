import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { getFormattedCode } from '../../../utils/commonHelper.js';
const { Schema, model } = mongoose;
import AutoIncrement from 'mongoose-sequence';

const countrySchema = new Schema(
  {
    code: {
      type: Number,
      unique: true,
      trim: true,
      get: (val) => getFormattedCode('CNT', val),
    },
    name: {
      english: {
        type: String,
        required: [true, 'Name is required'],
        unique: true,
        trim: true,
      },
      // hindi: {
      //   type: String,
      //   unique: true,
      //   trim: true,
      // },
    },
    // lgd: { type: String },
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
    // shortName: {
    //   english: {
    //     type: String,
    //     trim: true,
    //   },
    //   hindi: {
    //     type: String,
    //     trim: true,
    //   },
    // },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);
countrySchema.plugin(uniqueValidator, { message: 'Country Name should be unique.' });
countrySchema.plugin(AutoIncrement(mongoose), { inc_field: 'code', id: 'country' });

const Country = model('Country', countrySchema);

export default Country;
