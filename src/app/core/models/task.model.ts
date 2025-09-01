export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  status: 'Pendiente' | 'En progreso' | 'Completada';
  priority: 'Baja' | 'Media' | 'Alta';
  dueDate: string; // ISO string format
  assignedTo: number; // User ID
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'Baja' | 'Media' | 'Alta'; // Formato del formulario
  deadline: string; // Formato del input date
  responsible: User; // Usuario completo del formulario
}

export interface TaskCreateRequest {
  title: string;
  description: string;
  status: 'Pendiente';
  priority: 'Baja' | 'Media' | 'Alta';
  dueDate: string; // ISO string
  assignedTo: number;
}