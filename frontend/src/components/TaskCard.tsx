import { CalendarDays, Check, Pencil, Trash2 } from "lucide-react";

import { TASK_STATUSES } from "../types";
import type { Task, TaskStatus } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
  isSaving: boolean;
}

const avatarClasses = ["avatar-orange", "avatar-violet", "avatar-blue", "avatar-green"];

function formatDueDate(dueDate: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
    new Date(`${dueDate}T00:00:00`),
  );
}

export function TaskCard({
  task,
  onEdit,
  onToggle,
  onStatusChange,
  onDelete,
  isSaving,
}: TaskCardProps) {
  const avatarClass = avatarClasses[task.assignee.id % avatarClasses.length];
  const isOverdue = Boolean(
    task.due_date && task.status !== "done" && task.due_date < new Date().toISOString().slice(0, 10),
  );
  const statusLabel = TASK_STATUSES.find((status) => status.value === task.status)?.label;

  return (
    <article className={`task-card ${task.status}`}>
      <div className="task-heading">
        <span className={`priority-label ${task.priority}`}>{task.priority}</span>
        <div className="task-actions">
          <button
            className="icon-button compact"
            type="button"
            disabled={isSaving}
            aria-label={`Edit ${task.title}`}
            onClick={() => onEdit(task)}
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            className="icon-button compact danger"
            type="button"
            disabled={isSaving}
            aria-label={`Delete ${task.title}`}
            onClick={() => onDelete(task)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <h3>{task.title}</h3>
      <p className="task-description">{task.description}</p>

      <div className="task-metadata">
        <span className={`status-label ${task.status}`}>{statusLabel}</span>
        {task.due_date && (
          <span className={`due-date${isOverdue ? " overdue" : ""}`}>
            <CalendarDays size={14} aria-hidden="true" />
            {isOverdue ? "Overdue · " : "Due · "}
            {formatDueDate(task.due_date)}
          </span>
        )}
      </div>

      <div className="task-footer">
        <div className="assignee" title={`${task.assignee.name} · ${task.assignee.role}`}>
          <span className={`avatar ${avatarClass}`} aria-hidden="true">
            {task.assignee.initials}
          </span>
          <span>
            <strong>{task.assignee.name}</strong>
            <small>{task.assignee.role}</small>
          </span>
        </div>

        <button
          className="complete-control"
          type="button"
          disabled={isSaving}
          aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
          aria-pressed={task.completed}
          onClick={() => onToggle(task)}
        >
          <Check size={16} strokeWidth={3} aria-hidden="true" />
        </button>
      </div>

      <label className="move-control">
        <span>Move to</span>
        <select
          aria-label={`Status for ${task.title}`}
          disabled={isSaving}
          value={task.status}
          onChange={(event) => onStatusChange(task, event.target.value as TaskStatus)}
        >
          {TASK_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
    </article>
  );
}
