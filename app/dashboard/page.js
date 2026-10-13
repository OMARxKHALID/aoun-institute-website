import Link from "next/link";
import { BookOpen } from "lucide-react";
import { requireUser } from "@/lib/dal";

const DashboardPage = async () => {
  const user = await requireUser();
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <div>
        <p className="text-white/50">Welcome back</p>
        <h1 className="font-machina text-4xl md:text-5xl">{user.name}</h1>
      </div>
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-[#302C2A] p-8">
        <BookOpen className="size-10 text-accent" />
        <h2 className="text-2xl font-medium">No courses yet</h2>
        <p className="text-white/60">Browse the catalog to start your first course. Your progress, quizzes, and certificates will appear here.</p>
        <Link href="/courses" className="rounded-xl bg-white px-5 py-2.5 font-medium text-black transition hover:bg-accent hover:text-white">
          Browse courses
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
