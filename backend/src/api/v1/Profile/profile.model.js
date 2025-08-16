import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const profileSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    picture: { type: String, default: '' },

    classes: [{ type: mongoose.Types.ObjectId, ref: 'Class' }],
    sections: [{ type: mongoose.Types.ObjectId, ref: 'Section' }],
    subjects: [{ type: mongoose.Types.ObjectId, ref: 'Subject' }],
    institution: { type: mongoose.Types.ObjectId, ref: 'Institutes' },
    batchCode: [{ type: mongoose.Types.ObjectId }],

    rollNo: { type: String, default: '', trim: true },
    address1: { type: String, default: '', trim: true },
    address2: { type: String, default: '', trim: true },
    state: { type: mongoose.Types.ObjectId, ref: 'State' },
    district: { type: mongoose.Types.ObjectId, ref: 'District' },
    pincode: { type: String, default: '', trim: true },
    
    deleted: { type: Boolean, default: false },
  },
  {
    toJSON: { getters: true },
    timestamps: true,
  }
);

const User = model('Profile', profileSchema);

export default User;
