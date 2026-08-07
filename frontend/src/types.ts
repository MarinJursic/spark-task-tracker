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
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description: string;
  assignee_id: number;
}

export type TaskStatus = "all" | "open" | "completed";
