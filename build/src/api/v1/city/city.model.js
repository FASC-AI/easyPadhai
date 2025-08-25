import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { getFormattedCode } from '../../../utils/commonHelper.js';
const { Schema, model } = mongoose;
import AutoIncrement from 'mongoose-sequence';

const citySchema = new Schema(
  {
    code: {
      type: Number,
      unique: true,
      trim: true,
      get: (val) => getFormattedCode('CIT', val),
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
     district: {
      type: Schema.Types.ObjectId,
      ref: 'District',
    
    },
    name: {
      english: {
        type: String,
       unique: true,
        required: [true, 'Name is required'],
        trim: true,
      },
      
    },
    
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
citySchema.plugin(uniqueValidator, { message: 'City Name should be unique.' });
citySchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'code',
  id: 'city',
});

const City = model('City', citySchema);

export default City;
