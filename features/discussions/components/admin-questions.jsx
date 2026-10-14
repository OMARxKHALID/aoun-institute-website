"use client";

import { useState } from "react";
import DiscussionBoard from "@/features/discussions/components/discussion-board";
import TabList from "@/components/ui/tab-list";

const AdminQuestions = ({ threads }) => {
  const [filter, setFilter] = useState("all");
  const open = threads.filter((t) => !t.answered);
  const tabs = [
    { value: "all", label: `All (${threads.length})` },
    { value: "open", label: `Waiting for an answer (${open.length})` },
  ];
  return (
    <div className="flex flex-col gap-4">
      <TabList tabs={tabs} value={filter} onChange={setFilter} label="Question filter" size="sm" />
      <DiscussionBoard key={filter} threads={filter === "open" ? open : threads} admin />
    </div>
  );
};

export default AdminQuestions;
