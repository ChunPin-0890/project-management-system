// Shared TS interfaces — like C# DTO/response classes (no runtime code, types only).
export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface Project {
  id: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  startDate: string;
  taskCount?: number;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  status: TaskStatus;
  assigneeId: string | null;
  dueDate: string | null;
  version: number;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface TaskPage {
  items: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface TaskFilters {
  status?: TaskStatus | '';
  assigneeId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  page: number;
  limit: number;
}
