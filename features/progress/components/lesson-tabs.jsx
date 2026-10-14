"use client";

import { useEffect, useState } from "react";
import TabList from "@/components/ui/tab-list";

const hashTab = { "#questions": "qa", "#notes": "notes" };

const LessonTabs = ({ tabs }) => {
  const [active, setActive] = useState(tabs[0].value);
  const current = tabs.find((t) => t.value === active) ?? tabs[0];

  useEffect(() => {
    const fromHash = hashTab[window.location.hash];
    if (fromHash && tabs.some((t) => t.value === fromHash)) setActive(fromHash);
  }, [tabs]);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <TabList tabs={tabs} value={current.value} onChange={setActive} label="Lesson sections" />
      <div role="tabpanel" className="min-w-0">
        {current.content}
      </div>
    </div>
  );
};

export default LessonTabs;
