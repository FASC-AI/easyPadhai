import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';
import uniqueValidator from 'mongoose-unique-validator';

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    type: [
      {
        _id: { type: String }, // Changed from ObjectId to String
        nameEn: { type: String },
      },
    ],
    institution: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Institutes',
        required: [true, 'At least one institution is required'],
      },
    ],
    date: { type: Date },
    fromm: { type: Date },
    to: { type: Date },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

notificationSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'code',
  id: 'notification',
});
notificationSchema.plugin(uniqueValidator);

const Notification = model('Notification', notificationSchema);
export default Notification; 