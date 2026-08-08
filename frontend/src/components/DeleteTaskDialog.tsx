import { useEffect, useRef } from "react";
import { Trash2, X } from "lucide-react";

import type { Task } from "../types";
import { DialogError } from "./DialogError";

interface DeleteTaskDialogProps {
  task: Task;
  isDeleting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}

export function DeleteTaskDialog({
  task,
  isDeleting,
  errorMessage,
  onClose,
  onConfirm,
}: DeleteTaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

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
    if (await onConfirm()) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="task-dialog confirm-dialog"
      aria-labelledby="delete-task-title"
      aria-describedby="delete-task-description"
      onCancel={(event) => {
        if (isDeleting) event.preventDefault();
        else onClose();
      }}
    >
      <form method="dialog" aria-busy={isDeleting} onSubmit={submit}>
        <div className="dialog-header">
          <div>
            <span className="eyebrow">Permanent action</span>
            <h2 id="delete-task-title">Delete task?</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            disabled={isDeleting}
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="delete-warning" id="delete-task-description">
          <Trash2 size={22} aria-hidden="true" />
          <p>
            <strong>{task.title}</strong> will be permanently removed. This action cannot be
            undone.
          </p>
        </div>

        <DialogError message={errorMessage} />

        <div className="dialog-actions">
          <button className="button secondary" type="button" disabled={isDeleting} onClick={onClose}>
            Cancel
          </button>
          <button className="button danger" type="submit" disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete task"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
