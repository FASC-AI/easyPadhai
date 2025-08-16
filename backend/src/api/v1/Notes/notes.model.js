import mongoose from "mongoose";
const noteSchema = new mongoose.Schema({
  notes: [
    {
      title: { type: String, trim: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  classId: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  ],
  subjectId: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  ],
  createdAt: { type: Date, default: Date.now },
});
const Notes = mongoose.model("Note", noteSchema);

export default Notes;