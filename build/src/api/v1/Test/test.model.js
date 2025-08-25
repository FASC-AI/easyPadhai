import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';
import uniqueValidator from 'mongoose-unique-validator';

const { Schema, model } = mongoose;

const testSchema = new Schema(
  {
    codee: { type: String },
    TestsName: { type: String },
    isActive: {
      type: Boolean,
    },
    isLast: { type: Boolean, default: true },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    publishedDate: {
      type: Date,
    },
    lastId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
    },
    duration: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
    },
    testType: {
      type: String,
      enum: ['online', 'offline'],
    },
    questionType: {
      type: String,
    },
    description: { type: String },
    descriptionSol: { type: String },

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
    book: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        nameEn: { type: String },
      },
    ],

    lesson: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonMaster' },
        nameEn: { type: String },
      },
    ],
    topic: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        nameEn: { type: String },
      },
    ],
    displayTrue: { type: Boolean },
    option1: { type: Boolean },
    option2: { type: Boolean },
    option3: { type: Boolean },
    option4: { type: Boolean },
    mark1: { type: String },
    totalMarks: { type: String },
    publishedTime: { type: String },
    mark2: { type: String },
    mark3: { type: String },
    mark4: { type: String },
    totalTrue: { type: String },
    optionText1: { type: String },
    optionText2: { type: String },
    optionText3: { type: String },
    optionText4: { type: String },
    optionAssertionText1: { type: String },
    optionAssertionText2: { type: String },
    optionAssertionText3: { type: String },
    optionAssertionText4: { type: String },
    // Assertion-type questions
    optionAssertion1: { type: Boolean },
    optionAssertion2: { type: Boolean },
    optionAssertion3: { type: Boolean },
    optionAssertion4: { type: Boolean },
    markAssertion1: { type: String },
    markAssertion2: { type: String },
    markAssertion3: { type: String },
    markAssertion4: { type: String },

    // True/False questions
    optionTrue: { type: String },
    markTrue: { type: String },
    optionFalse: { type: String },
    markFalse: { type: String },
    desTrue: { type: String },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Plugins
testSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'code',
  id: 'test',
});
testSchema.plugin(uniqueValidator);

const Test = model('Test', testSchema);
export default Test;
