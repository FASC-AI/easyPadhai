import { required } from 'joi';
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  address1: { type: String, default: '' },
  address2: { type: String, default: '' },
  state: { type: mongoose.Types.ObjectId, ref: 'State', default: null },
  district: { type: mongoose.Types.ObjectId, ref: 'District', default: null },
  country: { type: mongoose.Types.ObjectId, ref: 'Country', default: null },
  pinCode: {
    type: String,
    match: [/^\d{6}$/, 'Pincode must be exactly 6 digits'],
    default: '',
  },
});

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    joinedBatch: { type: mongoose.Types.ObjectId, ref: 'Batch' },
    subjectId: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Subject',
        required: true,
      },
    ],
    bookId: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Book',
      },
    ],
    classId: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Class',
        required: true,
      },
    ],
    institution: { type: mongoose.Types.ObjectId, ref: 'Institutes' },
    sections: [{ type: mongoose.Types.ObjectId, ref: 'Section' }],
    batchCode: [{ type: mongoose.Types.ObjectId }],
    rollNo: { type: String, default: '', trim: true },
    name: {
      type: String,

      match: [
        /^[A-Za-z\s]{1,50}$/,
        'Name must contain only letters and spaces, up to 50 characters',
      ],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,

      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Invalid email address'],
    },
    mobile: {
      type: String,

      match: [/^\d{10}$/, 'Mobile number must be 10 digits'],

      trim: true,
    },
    address: {
      type: addressSchema,
      trim: true,
      default: () => ({}),
    },
    status: {
      type: String,
      trim: true,
      default: 'Active',
    },
    role: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

profileSchema.pre('save', function (next) {
  // Some logic that modifies status
  if (this.isNew) {
    this.status = 'Active'; // Overrides default
  }
  next();
});

export default mongoose.model('Userinfo', profileSchema);
