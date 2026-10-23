"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChartColumn, ExternalLink, Trash2 } from "lucide-react";
import { deleteCourse } from "@/features/courses/actions";
import CourseDetailsForm from "@/features/courses/components/course-details-form";
import SyllabusBuilder from "@/features/courses/components/syllabus-builder";
import SyllabusSettingsForm from "@/features/courses/components/syllabus-settings-form";
import TeachersForm from "@/features/courses/components/teachers-form";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";
import TabList from "@/components/ui/tab-list";
import { useDialog } from "@/components/ui/dialog-provider";

const tabs = ["Syllabus", "Details", "Settings"];

const CourseEditor = ({ course, outline, students, owner, teachers = [] }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [tab, setTab] = useState(tabs[0]);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!(await dialog.confirm({ title: `Delete "${course.title}"?`, message: "Its sections, lessons and quizzes are deleted too. This cannot be undone.", confirmLabel: "Delete course", danger: true }))) return;
    setDeleting(true);
    const result = await deleteCourse(course.id);
    setDeleting(false);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    router.push("/admin/courses");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill status={course.status} />
        <span className="text-white/50">
          {students} enrolled {students === 1 ? "student" : "students"}
          {course.status === "draft" && students > 0 && ` still ${students === 1 ? "has" : "have"} access`}
        </span>
        <Link href={`/admin/courses/${course.id}/analytics`} className="ml-auto flex items-center gap-1.5 text-sm text-accent hover:underline">
          <ChartColumn className="size-3.5" /> Lesson analytics
        </Link>
        {course.status === "published" && (
          <a href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-accent hover:underline">
            View public page <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>

      <TabList tabs={tabs} value={tab} onChange={setTab} label="Course editor" />

      <div role="tabpanel">
        {tab === "Syllabus" && <SyllabusBuilder courseId={course.id} outline={outline} />}
        {tab === "Details" && <CourseDetailsForm course={course} owner={owner} />}
        {tab === "Settings" && (
          <div className="flex flex-col gap-10">
            <SyllabusSettingsForm course={course} />
            {owner && <TeachersForm courseId={course.id} teachers={teachers} selected={course.teacherIds ?? []} />}
            {owner && (
              <section className="flex flex-col items-start gap-3 rounded-3xl border border-red-500/30 p-6">
                <h3 className="font-machina text-xl text-red-400">Danger zone</h3>
                <p className="text-white/70">Deleting removes the course, its sections, lessons and quizzes. Courses with enrolled students cannot be deleted; unpublish them instead.</p>
                <FormAlert>{error}</FormAlert>
                <Button type="button" variant="danger" loading={deleting} onClick={handleDelete}>
                  <Trash2 className="size-4" /> Delete course
                </Button>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseEditor;
