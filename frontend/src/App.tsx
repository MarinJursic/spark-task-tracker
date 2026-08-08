import { useCallback, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import { AppHeader } from "./components/AppHeader";
import { DeleteTaskDialog } from "./components/DeleteTaskDialog";
import { FilterBar } from "./components/FilterBar";
import { StatsBar } from "./components/StatsBar";
import { TaskFormDialog } from "./components/TaskFormDialog";
import { TaskList } from "./components/TaskList";
import { Toast } from "./components/Toast";
import { useTaskTracker } from "./hooks/useTaskTracker";
import type { Task, TaskInput, TaskStatus } from "./types";

export default function App() {
  const tracker = useTaskTracker();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TaskStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);

  const filteredTasks = useMemo(() => {
    const search = query.trim().toLowerCase();
    return tracker.tasks.filter((task) => {
      const matchesStatus =
        status === "all" || (status === "completed" ? task.completed : !task.completed);
      const matchesSearch =
        !search || `${task.title} ${task.description}`.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [query, status, tracker.tasks]);

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

  const deleteTask = async () => {
    if (!deletingTask) return false;

    clearSuccessMessage();
    const succeeded = await tracker.deleteTask(deletingTask.id);
    if (succeeded) {
      setSuccessMessage("Task deleted.");
    }

    return succeeded;
  };

  const completedCount = tracker.tasks.filter((task) => task.completed).length;

  return (
    <>
      <AppHeader />
      <main id="main-content" className="page-shell">
        <section className="page-intro">
          <div>
            <span className="eyebrow">Team workspace</span>
            <h1>
              Keep every task <em>moving.</em>
            </h1>
            <p>Add, assign, update, and complete work from one focused view.</p>
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

        <StatsBar total={tracker.tasks.length} completed={completedCount} />
        <FilterBar
          query={query}
          status={status}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
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
            hasFilters={Boolean(query.trim()) || status !== "all"}
            isSaving={tracker.isSaving}
            onEdit={openEditDialog}
            onToggle={(task) => void toggleTask(task)}
            onDelete={openDeleteDialog}
          />
        )}
      </main>

      {dialogOpen && (
        <TaskFormDialog
          task={editingTask}
          members={tracker.members}
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
