import { useCallback, useEffect, useState } from "react";

import { createTask, fetchTasks, fetchTeamMembers, updateTask } from "../services/api";
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

export function useTaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [taskData, memberData] = await Promise.all([fetchTasks(), fetchTeamMembers()]);
      setTasks(sortTasks(taskData));
      setMembers(memberData);
    } catch (loadError) {
      setError(toMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([fetchTasks(), fetchTeamMembers()])
      .then(([taskData, memberData]) => {
        if (cancelled) return;
        setTasks(sortTasks(taskData));
        setMembers(memberData);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(toMessage(loadError));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const runMutation = async (operation: () => Promise<Task>) => {
    setIsSaving(true);
    setError(null);
    try {
      const task = await operation();
      setTasks((current) => sortTasks([task, ...current.filter((item) => item.id !== task.id)]));
      return true;
    } catch (mutationError) {
      setError(toMessage(mutationError));
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
    error,
    clearError: () => setError(null),
    retry: load,
    addTask: (input: TaskInput) => runMutation(() => createTask(input)),
    editTask: (id: string, input: TaskInput) => runMutation(() => updateTask(id, input)),
    toggleTask: (task: Task) =>
      runMutation(() => updateTask(task.id, { completed: !task.completed })),
  };
}
