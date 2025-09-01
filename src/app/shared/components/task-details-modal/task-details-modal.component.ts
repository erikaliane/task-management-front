import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-details-modal',
  templateUrl: './task-details-modal.component.html',
  styleUrls: ['./task-details-modal.component.scss']
})
export class TaskDetailsModalComponent {
  @Input() isOpen: boolean = false;
  @Input() task: Task | null = null;
  @Input() hideAssignee: boolean = false;
  @Output() close = new EventEmitter<void>();

  constructor() {}

  onClose(): void {
    this.close.emit();
  }

  getPriorityClass(priority?: string): string {
    if (!priority) return 'priority-medium';
    switch (priority.toLowerCase()) {
      case 'alta':
        return 'priority-high';
      case 'media':
        return 'priority-medium';
      case 'baja':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  }

  getStatusClass(status?: string): string {
    if (!status) return 'status-pending';
    switch (status.toLowerCase()) {
      case 'completada':
        return 'status-completed';
      case 'en progreso':
        return 'status-progress';
      case 'pendiente':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  }

  formatDate(date?: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isOverdue(): boolean {
    if (!this.task) return false;
    const today = new Date();
    const dueDate = new Date(this.task.dueDate);
    return this.task.status !== 'Completada' && dueDate < today;
  }
}
