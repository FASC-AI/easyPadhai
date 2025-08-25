import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';
import uniqueValidator from 'mongoose-unique-validator';

const { Schema, model } = mongoose;

const instructionSchema = new Schema(
  {
    isActive: {
      type: Boolean,
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['Online Test', 'Offline Test'],
    },
    codee: { type: String },
    hindi: { type: String },
  
    description: { type: String },
    InstructionsName: { type: String },
    classes: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
        nameEn: { type: String },
      },
    ],
    subjects: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        nameEn: { type: String },
      },
    ],
  },
  { timestamps: true }
);

instructionSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'code',
  id: 'instruction',
});
instructionSchema.plugin(uniqueValidator);

const Instruction = model('Instruction', instructionSchema);
export default Instruction;
