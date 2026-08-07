import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { TaskFormDialog } from "./TaskFormDialog";

const member = { id: 1, name: "Amelia Hart", role: "Student Success Lead", initials: "AH" };

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
        isSaving={false}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Add a task" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "  Review notes  " },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Description" }), {
      target: { value: "  Check the new material.  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Review notes",
        description: "Check the new material.",
        assignee_id: member.id,
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
});
