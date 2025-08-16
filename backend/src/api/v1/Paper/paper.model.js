import mongoose from "mongoose";

const { Schema } = mongoose;

const PaperSchema = new Schema(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: false,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: false,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: false,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: false,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: false,
    },
    testIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Test",
        required: true,
      },
    ],
    duration: {
      type: String,
      default: "3 hours",
    },
    session: {
      type: String,
      default: "Term-End Examination",
    },
    date: {
      type: Date,
      default: null,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    instructions: {
      description: {
        type: String,
        default: "",
      },
    },
    groupedQuestions: [
      {
        type: {
          type: String,
          enum: ["MCQ", "Assertion-Reason", "True/False", "Descriptive"],
          required: true,
        },
        questions: [
          {
            testId: {
              type: Schema.Types.ObjectId,
              ref: "Test",
              required: true,
            },
            description: {
              type: String,
              required: true,
            },
            marks: {
              type: Number,
              required: true,
            },
            options: [
              {
                text: String,
                identifier: String,
              },
            ],
          },
        ],
        count: {
          type: Number,
          required: true,
        },
      },
    ],
    questionCounts: {
      mcq: { type: Number, default: 0 },
      trueFalse: { type: Number, default: 0 },
      descriptive: { type: Number, default: 0 },
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

PaperSchema.index({ subjectId: 1, classId: 1 });

export default mongoose.model("Paper", PaperSchema);
