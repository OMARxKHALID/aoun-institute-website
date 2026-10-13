import Link from "next/link";
import { BookOpen } from "lucide-react";
import { requireUser } from "@/lib/dal";
import PanelHeader from "@/components/ui/panel-header";

const DashboardPage = async () => {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];
  return (
    <>
      <PanelHeader title={`Welcome back, ${firstName} 👋`} subtitle="Here is what is happening with your learning." />
      <div className="grid gap-5 p-5 lg:p-8">
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-8">
          <span className="grid size-14 place-items-center rounded-2xl bg-accent/15 text-accent">
            <BookOpen className="size-7" />
          </span>
          <h2 className="text-2xl font-medium">No courses yet</h2>
          <p className="max-w-xl text-white/60">Browse the catalog to start your first course. Progress, quizzes and certificates will appear here.</p>
          <Link href="/courses" className="rounded-full bg-white px-5 py-2.5 font-medium text-black transition hover:bg-accent hover:text-white">
            Browse courses
          </Link>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
