import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { getFormattedCode } from '../../../utils/commonHelper.js';
const { Schema, model } = mongoose;
import AutoIncrement from 'mongoose-sequence';

const stateSchema = new Schema(
  {
    code: {
      type: Number,
      unique: true,
      trim: true,
      get: (val) => getFormattedCode('ST', val),
    },
    country: {
      type: Schema.Types.ObjectId,
      ref: "Country",
   
    },
    // lgd: { type: String },
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
stateSchema.plugin(uniqueValidator, { message: 'State Name should be unique.' });
stateSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'code',
  id: 'state',
});

const State = model('State', stateSchema);

export default State;
