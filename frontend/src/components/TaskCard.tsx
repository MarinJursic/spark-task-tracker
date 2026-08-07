import { Check, Pencil } from "lucide-react";

import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  isSaving: boolean;
}

const avatarClasses = ["avatar-orange", "avatar-violet", "avatar-blue", "avatar-green"];

export function TaskCard({ task, onEdit, onToggle, isSaving }: TaskCardProps) {
  const avatarClass = avatarClasses[task.assignee.id % avatarClasses.length];

  return (
    <article className={`task-card${task.completed ? " completed" : ""}`}>
      <button
        className="complete-control"
        type="button"
        disabled={isSaving}
        aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
        aria-pressed={task.completed}
        onClick={() => onToggle(task)}
      >
        {task.completed && <Check size={18} strokeWidth={3} aria-hidden="true" />}
      </button>

      <div className="task-content">
        <div className="task-heading">
          <div>
            <span className={`status-label ${task.completed ? "done" : "open"}`}>
              {task.completed ? "Completed" : "In progress"}
            </span>
            <h2>{task.title}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            disabled={isSaving}
            aria-label={`Edit ${task.title}`}
            onClick={() => onEdit(task)}
          >
            <Pencil size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="task-description">{task.description}</p>
        <div className="assignee">
          <span className={`avatar ${avatarClass}`} aria-hidden="true">
            {task.assignee.initials}
          </span>
          <span>
            <strong>{task.assignee.name}</strong>
            <small>{task.assignee.role}</small>
          </span>
        </div>
      </div>
    </article>
  );
}
