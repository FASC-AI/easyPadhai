import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { getFormattedCode } from '../../../utils/commonHelper.js';
const { Schema, model } = mongoose;
import AutoIncrement from 'mongoose-sequence';

const districtSchema = new Schema(
  {
    code: {
      type: Number,
      unique: true,
      trim: true,
      get: (val) => getFormattedCode('DST', val),
    },
  
    // lgd: { type: String },
    country: {
      type: Schema.Types.ObjectId,
      ref: "Country",

    },
    state: {
      type: Schema.Types.ObjectId,
      ref: 'State',
    
    },
    name: {
      english: {
        type: String,
       unique: true,
        required: [true, 'Name is required'],
        trim: true,
      },
      // hindi: {
      //   type: String,
      //   trim: true,
      //   index: {
      //     unique: true,
      //     partialFilterExpression: { hindi: { $type: 'string' } },
      //   },
      //   default: null,
      // },
    },
    // rtoCode: {},
    // districtPopulation: {},
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
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);
districtSchema.plugin(uniqueValidator, { message: 'District Name should be unique.' });
districtSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'code',
  id: 'district',
});

const District = model('District', districtSchema);

export default District;
