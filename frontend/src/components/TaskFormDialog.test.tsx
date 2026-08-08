import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { Task } from "../types";
import { TaskFormDialog } from "./TaskFormDialog";

const member = { id: 1, name: "Amelia Hart", role: "Student Success Lead", initials: "AH" };
const existingTask: Task = {
  id: "37d5820c-874e-48e5-86fc-bbbcd6841401",
  title: "Review lesson notes",
  description: "Check the new material.",
  assignee: member,
  status: "in_progress",
  completed: false,
  priority: "medium",
  due_date: null,
  created_at: "2026-08-07T08:00:00Z",
  updated_at: "2026-08-07T08:00:00Z",
};

describe("TaskFormDialog", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
  });

  it("has an accessible name and submits trimmed task details", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();
    render(
      <TaskFormDialog
        task={null}
        members={[member]}
        defaultAssigneeId={member.id}
        isSaving={false}
        errorMessage="Task could not be saved."
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Add a task" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Task could not be saved.");
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "  Review notes  " },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Description" }), {
      target: { value: "  Check the new material.  " },
    });
    expect(screen.getByText("Starting column").parentElement).toHaveTextContent("To do");
    fireEvent.change(screen.getByRole("combobox", { name: "Priority" }), {
      target: { value: "high" },
    });
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2026-08-18" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Review notes",
        description: "Check the new material.",
        assignee_id: member.id,
        status: "todo",
        priority: "high",
        due_date: "2026-08-18",
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("allows an existing task to change workflow status", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(
      <TaskFormDialog
        task={existingTask}
        members={[member]}
        defaultAssigneeId={member.id}
        isSaving={false}
        errorMessage={null}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Status" }), {
      target: { value: "done" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: "done" })),
    );
  });
});
