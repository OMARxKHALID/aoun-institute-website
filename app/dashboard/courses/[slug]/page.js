import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, CheckCircle2, Clock, FileDown, FileQuestion, PlayCircle } from "lucide-react";
import { getStudentCourse } from "@/features/progress/queries";
import { getMyAnnouncements } from "@/features/announcements/queries";
import AnnouncementList from "@/features/announcements/components/announcement-list";
import { getMyReview } from "@/features/reviews/queries";
import ReviewForm from "@/features/reviews/components/review-form";
import CourseOutline from "@/features/progress/components/course-outline";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import ProgressBar from "@/components/ui/progress-bar";
import { formatDuration } from "@/lib/format";
import { btn } from "@/lib/ui";
import { fileHref } from "@/lib/upload-rules";

export const metadata = { title: "Course" };

const StudentCoursePage = async ({ params }) => {
  const { slug } = await params;
  const data = await getStudentCourse(slug);
  if (!data) notFound();
  const { course, outline, stats, resume, certificate } = data;
  const [announcements, myReview] = await Promise.all([getMyAnnouncements(course.id, 5), getMyReview(course.id)]);
  const materials = [course.syllabusFile?.url && { ...course.syllabusFile, name: course.syllabusFile.name || "Syllabus.pdf" }, ...(course.attachments ?? [])].filter(Boolean);

  return (
    <>
      <PanelHeader back={{ href: "/dashboard/courses", label: "My courses" }} title={course.title} subtitle={course.subtitle} />
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-8">
        <div className="flex min-w-0 flex-col gap-5">
          {resume && (
            <Link
              href={`/dashboard/courses/${course.slug}/lessons/${resume.id}`}
              className="flex items-center gap-4 rounded-3xl bg-linear-to-br from-[#E8602E] to-[#7c2d12] p-5 transition hover:shadow-[0_0_40px_rgba(232,96,46,0.35)] sm:p-6"
            >
              <PlayCircle className="size-10 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm text-white/70">{stats.completedLessons ? "Continue where you left off" : "Start the course"}</span>
                <span className="block truncate font-machina text-xl sm:text-2xl">{resume.title}</span>
              </span>
            </Link>
          )}
          <AnnouncementList announcements={announcements} />
          <CourseOutline slug={course.slug} outline={outline} />
        </div>

        <aside className="flex min-w-0 flex-col gap-5">
          <PanelCard title="Your progress">
            <div className="flex items-center gap-3">
              <ProgressBar percent={stats.percent} />
              <span className="font-semibold">{stats.percent}%</span>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" /> {stats.completedLessons} of {stats.totalLessons} lessons completed
              </li>
              {stats.totalRequiredQuizzes > 0 && (
                <li className="flex items-center gap-2">
                  <FileQuestion className="size-4 text-accent" /> {stats.passedRequiredQuizzes} of {stats.totalRequiredQuizzes} required quizzes passed
                </li>
              )}
              <li className="flex items-center gap-2">
                <Clock className="size-4 text-accent" /> {formatDuration(stats.timeSpentSec)} watched
              </li>
            </ul>
          </PanelCard>

          <PanelCard title="Certificate">
            {certificate ? (
              <>
                <p className="flex items-center gap-2 text-green-400">
                  <Award className="size-5" /> You earned your certificate
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href={`/api/certificates/${certificate}/pdf`} className={btn.primary}>
                    Download PDF
                  </a>
                  <Link href={`/verify/${certificate}`} className={btn.outline}>
                    Public link
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-white/50">
                  {course.certificateRule?.type === "percent" ? `Complete ${course.certificateRule.percent}% of the lessons` : "Complete every lesson"}
                  {course.certificateRule?.requireQuizzes && stats.totalRequiredQuizzes > 0 ? " and pass the required quizzes" : ""} to earn your certificate.
                </p>
                {(stats.missing.lessons > 0 || stats.missing.quizzes.length > 0) && (
                  <ul className="flex flex-col gap-1 text-sm text-white/50">
                    {stats.missing.lessons > 0 && <li>• {stats.missing.lessons} more lessons to finish</li>}
                    {stats.missing.quizzes.map((q) => (
                      <li key={q.quizId}>• Pass “{q.title}”</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </PanelCard>

          <PanelCard title={myReview ? "Your review" : "Rate this course"}>
            <ReviewForm courseId={course.id} review={myReview} canReview={stats.completedLessons > 0} />
          </PanelCard>

          {materials.length > 0 && (
            <PanelCard title="Course materials">
              <ul className="flex flex-col gap-2">
                {materials.map((file) => (
                  <li key={file.publicId ?? file.url}>
                    <a href={fileHref(file)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#070707] p-3 text-sm hover:border-accent/50">
                      <FileDown className="size-4 shrink-0 text-accent" />
                      <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </PanelCard>
          )}
        </aside>
      </div>
    </>
  );
};

export default StudentCoursePage;
