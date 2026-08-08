import { useCallback, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import { AppHeader } from "./components/AppHeader";
import { DeleteTaskDialog } from "./components/DeleteTaskDialog";
import { FilterBar } from "./components/FilterBar";
import { StatsBar } from "./components/StatsBar";
import { TaskFormDialog } from "./components/TaskFormDialog";
import { TaskList } from "./components/TaskList";
import { Toast } from "./components/Toast";
import { useSessionMember } from "./hooks/useSessionMember";
import { useTaskTracker } from "./hooks/useTaskTracker";
import { TASK_STATUSES } from "./types";
import type { PriorityFilter, Task, TaskInput, TaskStatus } from "./types";

export default function App() {
  const tracker = useTaskTracker();
  const session = useSessionMember(tracker.members);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [mineOnly, setMineOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);

  const filteredTasks = useMemo(() => {
    const search = query.trim().toLowerCase();
    return tracker.tasks.filter((task) => {
      const matchesSearch =
        !search || `${task.title} ${task.description}`.toLowerCase().includes(search);
      const matchesPriority = priority === "all" || task.priority === priority;
      const matchesMember = !mineOnly || task.assignee.id === session.activeMemberId;
      return matchesSearch && matchesPriority && matchesMember;
    });
  }, [mineOnly, priority, query, session.activeMemberId, tracker.tasks]);

  const openCreateDialog = () => {
    tracker.clearActionError();
    clearSuccessMessage();
    setEditingTask(null);
    setDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    tracker.clearActionError();
    clearSuccessMessage();
    setEditingTask(task);
    setDialogOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    tracker.clearActionError();
    clearSuccessMessage();
    setDeletingTask(task);
  };

  const closeTaskDialog = () => {
    tracker.clearActionError();
    setDialogOpen(false);
  };

  const closeDeleteDialog = () => {
    tracker.clearActionError();
    setDeletingTask(null);
  };

  const submitTask = async (input: TaskInput) => {
    clearSuccessMessage();
    const wasEditing = editingTask !== null;
    const succeeded = wasEditing
      ? await tracker.editTask(editingTask.id, input)
      : await tracker.addTask(input);

    if (succeeded) {
      setSuccessMessage(wasEditing ? "Task updated." : "Task created.");
    }

    return succeeded;
  };

  const toggleTask = async (task: Task) => {
    clearSuccessMessage();
    const succeeded = await tracker.toggleTask(task);

    if (succeeded) {
      setSuccessMessage(task.completed ? "Task reopened." : "Task completed.");
    }
  };

  const moveTask = async (task: Task, status: TaskStatus) => {
    if (status === task.status) return;

    clearSuccessMessage();
    const succeeded = await tracker.moveTask(task, status);
    if (succeeded) {
      const label = TASK_STATUSES.find((option) => option.value === status)?.label ?? status;
      setSuccessMessage(`Task moved to ${label}.`);
    }
  };

  const deleteTask = async () => {
    if (!deletingTask) return false;

    clearSuccessMessage();
    const succeeded = await tracker.deleteTask(deletingTask.id);
    if (succeeded) {
      setSuccessMessage("Task deleted.");
    }

    return succeeded;
  };

  const todoCount = tracker.tasks.filter((task) => task.status === "todo").length;
  const inProgressCount = tracker.tasks.filter((task) => task.status === "in_progress").length;
  const doneCount = tracker.tasks.filter((task) => task.status === "done").length;

  return (
    <>
      <AppHeader
        members={tracker.members}
        activeMemberId={session.activeMemberId}
        onMemberChange={session.selectMember}
      />
      <main id="main-content" className="page-shell">
        <section className="page-intro">
          <div>
            <span className="eyebrow">Team workspace</span>
            <h1>
              Keep every task <em>moving.</em>
            </h1>
            <p>Plan, assign, and deliver team work from one focused board.</p>
          </div>
          <button
            className="button primary"
            type="button"
            disabled={tracker.members.length === 0}
            onClick={openCreateDialog}
          >
            <Plus size={20} aria-hidden="true" />
            Add task
          </button>
        </section>

        <StatsBar todo={todoCount} inProgress={inProgressCount} done={doneCount} />
        <FilterBar
          query={query}
          priority={priority}
          mineOnly={mineOnly}
          onQueryChange={setQuery}
          onPriorityChange={setPriority}
          onMineOnlyChange={setMineOnly}
        />

        {tracker.isLoading ? (
          <section className="loading-state" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <p>Loading the team’s tasks…</p>
          </section>
        ) : tracker.tasks.length === 0 && tracker.loadError ? (
          <section className="empty-state error-state" role="alert">
            <RefreshCw size={30} aria-hidden="true" />
            <h2>Tasks could not be loaded</h2>
            <p>Check the API connection, then try again.</p>
            <button className="button secondary" type="button" onClick={() => void tracker.retry()}>
              Try again
            </button>
          </section>
        ) : (
          <TaskList
            tasks={filteredTasks}
            hasFilters={Boolean(query.trim()) || priority !== "all" || mineOnly}
            isSaving={tracker.isSaving}
            onEdit={openEditDialog}
            onToggle={(task) => void toggleTask(task)}
            onStatusChange={(task, status) => void moveTask(task, status)}
            onDelete={openDeleteDialog}
          />
        )}
      </main>

      {dialogOpen && (
        <TaskFormDialog
          task={editingTask}
          members={tracker.members}
          defaultAssigneeId={session.activeMemberId}
          isSaving={tracker.isSaving}
          errorMessage={tracker.actionError}
          onClose={closeTaskDialog}
          onSubmit={submitTask}
        />
      )}
      {deletingTask && (
        <DeleteTaskDialog
          task={deletingTask}
          isDeleting={tracker.isSaving}
          errorMessage={tracker.actionError}
          onClose={closeDeleteDialog}
          onConfirm={deleteTask}
        />
      )}
      {tracker.actionError && !dialogOpen && !deletingTask && (
        <Toast tone="error" message={tracker.actionError} onDismiss={tracker.clearActionError} />
      )}
      {!tracker.actionError && successMessage && (
        <Toast
          tone="success"
          message={successMessage}
          onDismiss={clearSuccessMessage}
          durationMs={2800}
        />
      )}
    </>
  );
}
