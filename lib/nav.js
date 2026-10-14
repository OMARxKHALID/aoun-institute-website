import { Award, BookOpen, CalendarDays, ChartColumn, Compass, FileQuestion, History, Inbox, LayoutDashboard, LifeBuoy, Megaphone, MessageCircleQuestion, NotebookPen, Receipt, Settings, Star, TrendingUp, Users } from "lucide-react";

export const navs = {
  student: {
    groups: [
      {
        label: "Learning",
        items: [
          { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
          { label: "Explore", href: "/dashboard/explore", icon: Compass },
          { label: "Quizzes", href: "/dashboard/quizzes", icon: FileQuestion },
          { label: "Progress", href: "/dashboard/progress", icon: TrendingUp },
          { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
          { label: "My Notes", href: "/dashboard/notes", icon: NotebookPen },
          { label: "Certificates", href: "/dashboard/certificates", icon: Award },
        ],
      },
      {
        label: "Account",
        items: [
          { label: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
          { label: "Orders", href: "/dashboard/orders", icon: Receipt },
          { label: "Settings", href: "/dashboard/settings", icon: Settings },
          { label: "Help & Support", href: "/dashboard/support", icon: LifeBuoy },
        ],
      },
    ],
    promo: { title: "Keep learning", text: "Explore new courses and level up your skills.", href: "/dashboard/explore", cta: "Browse courses" },
  },
  admin: {
    groups: [
      {
        label: "Overview",
        items: [
          { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
          { label: "Reports", href: "/admin/reports", icon: ChartColumn },
        ],
      },
      {
        label: "Content",
        items: [
          { label: "Courses", href: "/admin/courses", icon: BookOpen },
          { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
          { label: "Questions", href: "/admin/questions", icon: MessageCircleQuestion },
          { label: "Reviews", href: "/admin/reviews", icon: Star },
        ],
      },
      {
        label: "People & sales",
        items: [
          { label: "Students", href: "/admin/students", icon: Users },
          { label: "Orders", href: "/admin/orders", icon: Receipt },
          { label: "Certificates", href: "/admin/certificates", icon: Award },
          { label: "Messages", href: "/admin/messages", icon: Inbox },
        ],
      },
      {
        label: "Website",
        items: [
          { label: "Site Settings", href: "/admin/settings", icon: Settings },
          { label: "Activity Log", href: "/admin/activity", icon: History },
        ],
      },
    ],
    promo: { title: "Your website", text: "See the public site the way students see it.", href: "/", cta: "View site" },
  },
};
