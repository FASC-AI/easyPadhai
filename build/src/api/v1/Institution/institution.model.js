import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';
import uniqueValidator from 'mongoose-unique-validator';

const { Schema, model } = mongoose;

const institutesSchema = new Schema(
  {
    description: { type: String },
    status: { type: String, default: 'Active' },
    instituteCode: { type: String,  required: true },
    isActive: {
      type: Boolean,
    },
    isVerified: {
      type: Boolean,
    },
    address: {
      country: { type: Schema.Types.ObjectId, trim: true, ref: 'Country' },
      stateId: { type: Schema.Types.ObjectId, ref: 'State', trim: true },
      districtId: { type: Schema.Types.ObjectId, trim: true, ref: 'District' },
      cityId: { type: Schema.Types.ObjectId, trim: true, ref: 'City' },
      pinCode: { type: String, trim: true },
      address1: { type: String, trim: true },
      address2: { type: String, trim: true },
    },
    instituteType: { type: String },

    institutesName: { type: String },
    phone: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

institutesSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'code',
  id: 'institutes',
});
institutesSchema.plugin(uniqueValidator, {
  message: 'Error, expected {PATH} to be unique.'
});

const Institutes = model('Institutes', institutesSchema);
export default Institutes;
