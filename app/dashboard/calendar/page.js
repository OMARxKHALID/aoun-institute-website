import { getCalendar } from "@/features/calendar/queries";
import MonthCalendar from "@/features/calendar/components/month-calendar";
import StudyPlanForm from "@/features/calendar/components/study-plan-form";
import PlanList from "@/features/calendar/components/plan-list";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";

export const metadata = { title: "Study Calendar" };

const CalendarPage = async ({ searchParams }) => {
  const { m } = await searchParams;
  const c = await getCalendar(m);
  return (
    <>
      <PanelHeader title="Study calendar" subtitle="Plan study sessions and get a reminder email that morning." />
      <div className="grid gap-5 p-4 sm:p-5 lg:p-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PanelCard>
          <MonthCalendar month={c.month} prev={c.prev} next={c.next} today={c.today} plans={c.plans} studied={c.studied} basePath="/dashboard/calendar" />
        </PanelCard>
        <aside className="flex min-w-0 flex-col gap-5">
          <PanelCard title="Plan a session">
            <StudyPlanForm courses={c.courses} today={c.today} />
          </PanelCard>
          <PanelCard title="Coming up">
            <PlanList plans={c.upcoming} empty="Nothing planned. Add your first study session above." />
          </PanelCard>
        </aside>
      </div>
    </>
  );
};

export default CalendarPage;
