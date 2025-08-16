const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema(
  {
    subjectId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
      },
    ],
    classId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
      },
    ],
    lessonId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LessonMaster',
        required: true,
      },
    ],
    bookId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
    ],
    topicId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    publishedDate:{
      type:Date
    },
    isLast:{
      type:Boolean,
      default:true
    },
    question: {
      type: String,
      trim: true,
    },

    solution: {
      type: String,
      trim: true,
    },

    videoTutorialLink: {
      type: String,
      trim: true,
    },
    hint: {
      type: String,
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
  }
);

module.exports = mongoose.model('Homework', homeworkSchema);
