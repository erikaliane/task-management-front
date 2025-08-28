export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId: number;
  assignedTo?: User;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  assignedToId: number;
  dueDate: string;
}

import { User } from './auth.model';