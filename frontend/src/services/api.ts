import type { Task, TaskInput, TeamMember } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "The request could not be completed.";

  const firstValue = Object.values(payload)[0];
  if (Array.isArray(firstValue) && typeof firstValue[0] === "string") return firstValue[0];
  if (typeof firstValue === "string") return firstValue;
  return "The request could not be completed.";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new ApiError(getErrorMessage(payload));
  }

  return response.json() as Promise<T>;
}

export function fetchTasks(signal?: AbortSignal): Promise<Task[]> {
  return request<Task[]>("/tasks/", { signal });
}

export function fetchTeamMembers(signal?: AbortSignal): Promise<TeamMember[]> {
  return request<TeamMember[]>("/team-members/", { signal });
}

export function createTask(input: TaskInput): Promise<Task> {
  return request<Task>("/tasks/", {
    method: "POST",
    body: JSON.stringify({ ...input, completed: false }),
  });
}

export function updateTask(id: string, input: Partial<TaskInput & Pick<Task, "completed">>) {
  return request<Task>(`/tasks/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
