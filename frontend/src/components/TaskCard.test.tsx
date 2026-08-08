import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Task } from "../types";
import { TaskCard } from "./TaskCard";

const task: Task = {
  id: "37d5820c-874e-48e5-86fc-bbbcd6841401",
  title: "Review lesson notes",
  description: "Check the new material before the tutoring session.",
  assignee: { id: 1, name: "Amelia Hart", role: "Student Success Lead", initials: "AH" },
  status: "in_progress",
  completed: false,
  priority: "high",
  due_date: "2026-08-20",
  created_at: "2026-08-07T08:00:00Z",
  updated_at: "2026-08-07T08:00:00Z",
};

describe("TaskCard", () => {
  it("shows task details and exposes the required actions", () => {
    const onEdit = vi.fn();
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    render(
      <TaskCard
        task={task}
        isSaving={false}
        onEdit={onEdit}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
        isDragging={false}
      />,
    );

    expect(screen.getByRole("heading", { name: task.title })).toBeInTheDocument();
    expect(screen.getAllByText("In progress")).toHaveLength(2);
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText(task.assignee.name)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: `Edit ${task.title}` }));
    fireEvent.click(screen.getByRole("button", { name: `Delete ${task.title}` }));
    fireEvent.change(screen.getByRole("combobox", { name: `Status for ${task.title}` }), {
      target: { value: "done" },
    });

    expect(onEdit).toHaveBeenCalledWith(task);
    expect(onDelete).toHaveBeenCalledWith(task);
    expect(onStatusChange).toHaveBeenCalledWith(task, "done");
  });
});
