import Link from "next/link";
import { Settings } from "lucide-react";
import { requireAdmin } from "@/lib/dal";

const AdminPage = async () => {
  const user = await requireAdmin();
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <div>
        <p className="text-white/50">Signed in as {user.email}</p>
        <h1 className="font-machina text-4xl md:text-5xl">Admin</h1>
      </div>
      <Link href="/admin/settings" className="flex max-w-md items-center gap-4 rounded-2xl border border-[#302C2A] p-6 transition hover:border-accent">
        <Settings className="size-8 text-accent" />
        <div>
          <p className="text-xl font-medium">Site Settings</p>
          <p className="text-white/60">Brand, contact, homepage content, SEO, payment details</p>
        </div>
      </Link>
    </div>
  );
};

export default AdminPage;
