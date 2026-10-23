import "server-only";
import { Types } from "mongoose";
import { db } from "@/lib/db";
import Enrollment from "@/features/enrollments/model";
import LessonProgress from "@/features/progress/models/lesson-progress";
import CourseProgress from "@/features/progress/models/course-progress";
import ActivityLog from "@/features/progress/models/activity-log";
import QuizAttempt from "@/features/quizzes/models/quiz-attempt";
import AttemptGrant from "@/features/quizzes/models/attempt-grant";
import PlaybackSession from "@/features/video/playback-session";
import Note from "@/features/notes/model";
import StudyPlan from "@/features/calendar/model";
import Review from "@/features/reviews/model";
import Discussion from "@/features/discussions/model";
import Notification from "@/features/notifications/model";

export const DELETION_GRACE_DAYS = 30;

export const deletionDate = (requestedAt) => new Date(new Date(requestedAt).getTime() + DELETION_GRACE_DAYS * 86_400_000);

export const eraseStudyData = (userId) =>
  Promise.all([
    Enrollment.deleteMany({ userId }),
    LessonProgress.deleteMany({ userId }),
    CourseProgress.deleteMany({ userId }),
    ActivityLog.deleteMany({ userId }),
    QuizAttempt.deleteMany({ userId }),
    AttemptGrant.deleteMany({ userId }),
    PlaybackSession.deleteMany({ userId }),
    Note.deleteMany({ userId }),
    StudyPlan.deleteMany({ userId }),
    Review.deleteMany({ userId }),
    Notification.deleteMany({ userId }),
    Discussion.updateMany({ userId }, { $set: { authorName: "Former student" } }),
  ]);

export const eraseAccount = (userId) => {
  const _id = new Types.ObjectId(userId);
  return Promise.all([db.collection("session").deleteMany({ userId: _id }), db.collection("account").deleteMany({ userId: _id }), db.collection("user").deleteOne({ _id, role: { $ne: "ADMIN" } })]);
};
