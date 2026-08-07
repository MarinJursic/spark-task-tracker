import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import type { Task, TaskInput, TeamMember } from "../types";

interface TaskFormDialogProps {
  task: Task | null;
  members: TeamMember[];
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<boolean>;
}

const EMPTY_FORM = { title: "", description: "", assigneeId: "" };

export function TaskFormDialog({
  task,
  members,
  isSaving,
  onClose,
  onSubmit,
}: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
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
    <dialog ref={dialogRef} className="task-dialog" onCancel={onClose}>
      <form method="dialog" onSubmit={submit}>
        <div className="dialog-header">
          <div>
            <span className="eyebrow">{task ? "Update the details" : "Create clear ownership"}</span>
            <h2>{task ? "Edit task" : "Add a task"}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <label>
          <span>Title</span>
          <input
            autoFocus
            required
            maxLength={120}
            value={form.title}
            placeholder="What needs to be done?"
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
          <small>{form.title.length}/120</small>
        </label>

        <label>
          <span>Description</span>
          <textarea
            required
            rows={5}
            maxLength={1000}
            value={form.description}
            placeholder="Add enough context for someone to take action."
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <small>{form.description.length}/1000</small>
        </label>

        <label>
          <span>Assign to</span>
          <select
            required
            value={form.assigneeId}
            onChange={(event) => setForm({ ...form, assigneeId: event.target.value })}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} · {member.role}
              </option>
            ))}
          </select>
        </label>

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
