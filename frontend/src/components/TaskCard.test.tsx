import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Task } from "../types";
import { TaskCard } from "./TaskCard";

const task: Task = {
  id: "37d5820c-874e-48e5-86fc-bbbcd6841401",
  title: "Review lesson notes",
  description: "Check the new material before the tutoring session.",
  assignee: { id: 1, name: "Amelia Hart", role: "Student Success Lead", initials: "AH" },
  completed: false,
  created_at: "2026-08-07T08:00:00Z",
  updated_at: "2026-08-07T08:00:00Z",
};

describe("TaskCard", () => {
  it("shows task details and exposes the required actions", () => {
    const onEdit = vi.fn();
    const onToggle = vi.fn();
    render(<TaskCard task={task} isSaving={false} onEdit={onEdit} onToggle={onToggle} />);

    expect(screen.getByRole("heading", { name: task.title })).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText(task.assignee.name)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: `Edit ${task.title}` }));
    fireEvent.click(screen.getByRole("button", { name: `Mark ${task.title} as complete` }));

    expect(onEdit).toHaveBeenCalledWith(task);
    expect(onToggle).toHaveBeenCalledWith(task);
  });
});
