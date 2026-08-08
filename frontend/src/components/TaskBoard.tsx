import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import { CircleCheckBig, CircleDashed, TimerReset } from "lucide-react";

import type { Task, TaskStatus } from "../types";
import { TaskBoardColumn } from "./TaskBoardColumn";

interface TaskBoardProps {
  tasks: Task[];
  hasFilters: boolean;
  isSaving: boolean;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
}

const TASK_DRAG_TYPE = "application/x-spark-task-id";
const columns = [
  { status: "todo" as const, label: "To do", Icon: CircleDashed },
  { status: "in_progress" as const, label: "In progress", Icon: TimerReset },
  { status: "done" as const, label: "Done", Icon: CircleCheckBig },
];

function groupTasks(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
  tasks.forEach((task) => grouped[task.status].push(task));
  return grouped;
}

export function TaskBoard({
  tasks,
  hasFilters,
  isSaving,
  onEdit,
  onToggle,
  onStatusChange,
  onDelete,
}: TaskBoardProps) {
  const tasksByStatus = useMemo(() => groupTasks(tasks), [tasks]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);

  const finishDrag = () => {
    setDraggedTaskId(null);
    setDropTarget(null);
  };

  const startDrag = (event: DragEvent<HTMLElement>, task: Task) => {
    if (isSaving) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(TASK_DRAG_TYPE, task.id);
    event.dataTransfer.setData("text/plain", task.id);
    setDraggedTaskId(task.id);
  };

  const allowDrop = (event: DragEvent<HTMLElement>, status: TaskStatus) => {
    if (!draggedTaskId || isSaving) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget(status);
  };

  const dropTask = (event: DragEvent<HTMLElement>, status: TaskStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData(TASK_DRAG_TYPE) || draggedTaskId;
    const task = tasks.find((candidate) => candidate.id === taskId);
    finishDrag();

    if (task && task.status !== status) onStatusChange(task, status);
  };

  return (
    <section className="task-board-region" aria-label="Team task board">
      <p className="board-guidance">Drag cards between columns, or scroll and use the status menu.</p>
      <div className="task-board">
        {columns.map(({ status, label, Icon }) => (
          <TaskBoardColumn
            key={status}
            status={status}
            label={label}
            Icon={Icon}
            tasks={tasksByStatus[status]}
            hasFilters={hasFilters}
            isSaving={isSaving}
            draggedTaskId={draggedTaskId}
            isDropTarget={dropTarget === status}
            onDragStart={startDrag}
            onDragEnd={finishDrag}
            onDragOver={(event) => allowDrop(event, status)}
            onDrop={(event) => dropTask(event, status)}
            onEdit={onEdit}
            onToggle={onToggle}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}
