import { Schema, model, models } from "mongoose";

const submissionSchema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    userId: { type: String, required: true },
    text: String,
    files: [{ publicId: String, name: String, format: String }],
    status: { type: String, enum: ["submitted", "graded"], default: "submitted" },
    grade: Number,
    feedback: String,
    gradedBy: String,
    gradedAt: Date,
    submittedAt: Date,
  },
  { timestamps: true },
);

submissionSchema.index({ assignmentId: 1, userId: 1 }, { unique: true });
submissionSchema.index({ userId: 1 });

export default models.Submission || model("Submission", submissionSchema);
