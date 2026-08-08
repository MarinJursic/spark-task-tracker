import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import type { Task, TaskInput, TeamMember } from "../types";
import { DialogError } from "./DialogError";

interface TaskFormDialogProps {
  task: Task | null;
  members: TeamMember[];
  isSaving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<boolean>;
}

const EMPTY_FORM = { title: "", description: "", assigneeId: "" };

export function TaskFormDialog({
  task,
  members,
  isSaving,
  errorMessage,
  onClose,
  onSubmit,
}: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = "task-dialog-title";
  const titleLabelId = "task-title-label";
  const titleCountId = "task-title-count";
  const descriptionLabelId = "task-description-label";
  const descriptionCountId = "task-description-count";
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    title: task?.title ?? "",
    description: task?.description ?? "",
    assigneeId: String(task?.assignee.id ?? members[0]?.id ?? ""),
  }));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const succeeded = await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      assignee_id: Number(form.assigneeId),
    });
    if (succeeded) onClose();
  };

  return (
    <dialog ref={dialogRef} className="task-dialog" aria-labelledby={titleId} onCancel={onClose}>
      <form method="dialog" aria-busy={isSaving} onSubmit={submit}>
        <div className="dialog-header">
          <div>
            <span className="eyebrow">{task ? "Update the details" : "Create clear ownership"}</span>
            <h2 id={titleId}>{task ? "Edit task" : "Add a task"}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <label htmlFor="task-title">
          <span id={titleLabelId}>Title</span>
          <input
            id="task-title"
            autoFocus
            required
            disabled={isSaving}
            maxLength={120}
            aria-labelledby={titleLabelId}
            aria-describedby={titleCountId}
            value={form.title}
            placeholder="What needs to be done?"
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
          <small id={titleCountId}>{form.title.length}/120</small>
        </label>

        <label htmlFor="task-description">
          <span id={descriptionLabelId}>Description</span>
          <textarea
            id="task-description"
            required
            disabled={isSaving}
            rows={5}
            maxLength={1000}
            aria-labelledby={descriptionLabelId}
            aria-describedby={descriptionCountId}
            value={form.description}
            placeholder="Add enough context for someone to take action."
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <small id={descriptionCountId}>{form.description.length}/1000</small>
        </label>

        <label htmlFor="task-assignee">
          <span>Assign to</span>
          <select
            id="task-assignee"
            required
            disabled={isSaving}
            value={form.assigneeId}
            onChange={(event) => setForm({ ...form, assigneeId: event.target.value })}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <DialogError message={errorMessage} />

        <div className="dialog-actions">
          <button className="button secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit" disabled={isSaving || members.length === 0}>
            {isSaving ? "Saving…" : task ? "Save changes" : "Add task"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
