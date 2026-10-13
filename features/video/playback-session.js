import { Schema, model, models } from "mongoose";

const playbackSessionSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    deviceId: { type: String, required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
    startedAt: { type: Date, default: Date.now },
    heartbeatAt: { type: Date, default: Date.now },
  },
  { collection: "playbackSessions" },
);

playbackSessionSchema.index({ heartbeatAt: 1 }, { expireAfterSeconds: 120 });

export default models.PlaybackSession || model("PlaybackSession", playbackSessionSchema);
