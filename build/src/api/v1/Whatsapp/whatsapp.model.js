import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const whatsAppSchema = new Schema(
  {
    teacherWhatsapp: {
      type: String,
      required: [true, 'Teacher Whatsapp is required'],
      trim: true,
    },
    studentWhatsapp: {
      type: String,
      required: [true, 'Student Whatsapp is required'],
      trim: true,
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


const Whatsapp = model('Whatsapp', whatsAppSchema);
export default Whatsapp;
