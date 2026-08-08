import type { DragEvent } from "react";
import type { LucideIcon } from "lucide-react";

import type { Task, TaskStatus } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskBoardColumnProps {
  status: TaskStatus;
  label: string;
  Icon: LucideIcon;
  tasks: Task[];
  hasFilters: boolean;
  isSaving: boolean;
  draggedTaskId: string | null;
  isDropTarget: boolean;
  onDragStart: (event: DragEvent<HTMLElement>, task: Task) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
}

function emptyMessage(status: TaskStatus, hasFilters: boolean): string {
  if (hasFilters) return "No matching tasks.";
  return status === "todo" ? "No tasks to start." : "Drop a task here.";
}

export function TaskBoardColumn({
  status,
  label,
  Icon,
  tasks,
  hasFilters,
  isSaving,
  draggedTaskId,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onEdit,
  onToggle,
  onStatusChange,
  onDelete,
}: TaskBoardColumnProps) {
  const headingId = `${status}-heading`;

  return (
    <section
      className={`board-column ${status}${isDropTarget ? " is-drop-target" : ""}`}
      aria-labelledby={headingId}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <header className="column-header">
        <span>
          <Icon size={18} aria-hidden="true" />
          <h2 id={headingId}>{label}</h2>
        </span>
        <strong aria-label={`${tasks.length} tasks`}>{tasks.length}</strong>
      </header>

      <div className="column-tasks">
        {tasks.length === 0 ? (
          <p className="empty-column">{emptyMessage(status, hasFilters)}</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isSaving={isSaving}
              isDragging={draggedTaskId === task.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
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
}
