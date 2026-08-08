import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Task } from "../types";
import { TaskBoard } from "./TaskBoard";

const task: Task = {
  id: "37d5820c-874e-48e5-86fc-bbbcd6841401",
  title: "Review lesson notes",
  description: "Check the new material before the tutoring session.",
  assignee: { id: 1, name: "Amelia Hart", role: "Student Success Lead", initials: "AH" },
  status: "todo",
  completed: false,
  priority: "high",
  due_date: null,
  created_at: "2026-08-07T08:00:00Z",
  updated_at: "2026-08-07T08:00:00Z",
};

function createDataTransfer() {
  const data = new Map<string, string>();
  return {
    effectAllowed: "none",
    dropEffect: "none",
    getData: (type: string) => data.get(type) ?? "",
    setData: (type: string, value: string) => data.set(type, value),
    setDragImage: vi.fn(),
  };
}

describe("TaskBoard", () => {
  it("moves a task when its card is dropped into another column", () => {
    const onStatusChange = vi.fn();
    const dataTransfer = createDataTransfer();
    render(
      <TaskBoard
        tasks={[task]}
        hasFilters={false}
        isSaving={false}
        onEdit={vi.fn()}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.dragStart(screen.getByTitle("Drag to change status"), { dataTransfer });
    const doneColumn = screen.getByRole("region", { name: "Done" });
    fireEvent.dragOver(doneColumn, { dataTransfer });
    fireEvent.drop(doneColumn, { dataTransfer });

    expect(onStatusChange).toHaveBeenCalledWith(task, "done");
  });
});
