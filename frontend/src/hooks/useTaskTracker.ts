import { useCallback, useEffect, useState } from "react";

import { createTask, deleteTask, fetchTasks, fetchTeamMembers, updateTask } from "../services/api";
import type { Task, TaskInput, TeamMember } from "../types";

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => {
    if (left.completed !== right.completed) return Number(left.completed) - Number(right.completed);
    return Date.parse(right.updated_at) - Date.parse(left.updated_at);
  });
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function fetchTrackerData(signal?: AbortSignal) {
  return Promise.all([fetchTasks(signal), fetchTeamMembers(signal)]);
}

export function useTaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [taskData, memberData] = await fetchTrackerData();
      setTasks(sortTasks(taskData));
      setMembers(memberData);
    } catch (loadError) {
      setLoadError(toMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchTrackerData(controller.signal)
      .then(([taskData, memberData]) => {
        setTasks(sortTasks(taskData));
        setMembers(memberData);
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) setLoadError(toMessage(loadError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  const runMutation = async (operation: () => Promise<Task>) => {
    setIsSaving(true);
    setActionError(null);
    try {
      const task = await operation();
      setTasks((current) => sortTasks([task, ...current.filter((item) => item.id !== task.id)]));
      return true;
    } catch (mutationError) {
      setActionError(toMessage(mutationError));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const removeTask = async (id: string) => {
    setIsSaving(true);
    setActionError(null);
    try {
      await deleteTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
      return true;
    } catch (mutationError) {
      setActionError(toMessage(mutationError));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    tasks,
    members,
    isLoading,
    isSaving,
    loadError,
    actionError,
    clearActionError: () => setActionError(null),
    retry: load,
    addTask: (input: TaskInput) => runMutation(() => createTask(input)),
    editTask: (id: string, input: TaskInput) => runMutation(() => updateTask(id, input)),
    toggleTask: (task: Task) =>
      runMutation(() => updateTask(task.id, { completed: !task.completed })),
    deleteTask: removeTask,
  };
}
