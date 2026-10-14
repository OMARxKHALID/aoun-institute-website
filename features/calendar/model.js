import { Schema, model, models } from "mongoose";

const studyPlanSchema = new Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    title: { type: String, required: true },
    startsAt: { type: Date, required: true },
    durationMin: { type: Number, min: 5, max: 600, default: 30 },
    done: { type: Boolean, default: false },
    remindedAt: Date,
  },
  { collection: "studyPlans", timestamps: true },
);

studyPlanSchema.index({ userId: 1, startsAt: 1 });
studyPlanSchema.index({ startsAt: 1, remindedAt: 1, done: 1 });

export default models.StudyPlan || model("StudyPlan", studyPlanSchema);
