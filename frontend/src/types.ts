export interface TeamMember {
  id: number;
  name: string;
  role: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: TeamMember;
  status: TaskStatus;
  completed: boolean;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description: string;
  assignee_id: number;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type PriorityFilter = "all" | TaskPriority;

export const TASK_STATUSES: { label: string; value: TaskStatus }[] = [
  { label: "To do", value: "todo" },
  { label: "In progress", value: "in_progress" },
  { label: "Done", value: "done" },
];
