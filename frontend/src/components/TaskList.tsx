import { ClipboardCheck, SearchX } from "lucide-react";

import type { Task } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  hasFilters: boolean;
  isSaving: boolean;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({
  tasks,
  hasFilters,
  isSaving,
  onEdit,
  onToggle,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    const Icon = hasFilters ? SearchX : ClipboardCheck;
    return (
      <section className="empty-state">
        <Icon size={30} aria-hidden="true" />
        <h2>{hasFilters ? "No matching tasks" : "Your task list is clear"}</h2>
        <p>
          {hasFilters
            ? "Try a different search or status filter."
            : "Add the first task to give the team a clear next step."}
        </p>
      </section>
    );
  }

  return (
    <section className="task-list" aria-label="Team tasks">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isSaving={isSaving}
          onEdit={onEdit}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
