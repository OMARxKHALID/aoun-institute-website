import { Award, BookOpen, CalendarDays, ChartColumn, Compass, FileQuestion, History, Inbox, LayoutDashboard, LifeBuoy, Megaphone, MessageCircleQuestion, NotebookPen, Receipt, Settings, Star, TicketPercent, TrendingUp, Users } from "lucide-react";

export const navs = {
  student: {
    groups: [
      {
        label: "Overview",
        items: [
          { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { label: "Progress", href: "/dashboard/progress", icon: TrendingUp },
          { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
        ],
      },
      {
        label: "Learning",
        items: [
          { label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
          { label: "Explore", href: "/dashboard/explore", icon: Compass },
          { label: "Quizzes", href: "/dashboard/quizzes", icon: FileQuestion },
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
          { label: "Dashboard", href: "/admin", icon: LayoutDashboard, owner: true },
          { label: "Reports", href: "/admin/reports", icon: ChartColumn, owner: true },
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
          { label: "Orders", href: "/admin/orders", icon: Receipt, owner: true },
          { label: "Coupons", href: "/admin/coupons", icon: TicketPercent, owner: true },
          { label: "Certificates", href: "/admin/certificates", icon: Award, owner: true },
          { label: "Messages", href: "/admin/messages", icon: Inbox, owner: true },
        ],
      },
      {
        label: "Website",
        items: [
          { label: "Site Settings", href: "/admin/settings", icon: Settings, owner: true },
          { label: "Activity Log", href: "/admin/activity", icon: History, owner: true },
        ],
      },
    ],
    promo: { title: "Your website", text: "See the public site the way students see it.", href: "/", cta: "View site" },
  },
};
