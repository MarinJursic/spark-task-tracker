import { CircleCheckBig, CircleDashed, TimerReset } from "lucide-react";

import type { Task, TaskStatus } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  hasFilters: boolean;
  isSaving: boolean;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
}

const columns = [
  { status: "todo" as const, label: "To do", Icon: CircleDashed },
  { status: "in_progress" as const, label: "In progress", Icon: TimerReset },
  { status: "done" as const, label: "Done", Icon: CircleCheckBig },
];

export function TaskList({
  tasks,
  hasFilters,
  isSaving,
  onEdit,
  onToggle,
  onStatusChange,
  onDelete,
}: TaskListProps) {
  return (
    <section className="task-board" aria-label="Team task board">
      {columns.map(({ status, label, Icon }) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        return (
          <section className={`board-column ${status}`} aria-labelledby={`${status}-heading`} key={status}>
            <header className="column-header">
              <span>
                <Icon size={18} aria-hidden="true" />
                <h2 id={`${status}-heading`}>{label}</h2>
              </span>
              <strong aria-label={`${columnTasks.length} tasks`}>{columnTasks.length}</strong>
            </header>

            <div className="column-tasks">
              {columnTasks.length === 0 ? (
                <p className="empty-column">
                  {hasFilters ? "No matching tasks." : `No tasks ${status === "todo" ? "to start" : "here"}.`}
                </p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isSaving={isSaving}
                    onEdit={onEdit}
                    onToggle={onToggle}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </section>
  );
}
