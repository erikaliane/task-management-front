import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Input() showActions: boolean = true;
  @Input() hideAssignee: boolean = false;
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<number>();
  @Output() viewDetails = new EventEmitter<Task>();

  getPriorityColor(): string {
    switch (this.task.priority) {
      case 'Alta': return '#ef4444';
      case 'Media': return '#f59e0b';
      case 'Baja': return '#10b981';
      default: return '#6b7280';
    }
  }

  getPriorityText(): string {
    switch (this.task.priority) {
      case 'Alta': return 'Alta';
      case 'Media': return 'Media';
      case 'Baja': return 'Baja';
      default: return 'Sin prioridad';
    }
  }

  getStatusColor(): string {
    switch (this.task.status) {
      case 'Pendiente': return '#f59e0b';
      case 'En progreso': return '#3b82f6';
      case 'Completada': return '#10b981';
      default: return '#6b7280';
    }
  }

  getStatusText(): string {
    switch (this.task.status) {
      case 'Pendiente': return 'Pendiente';
      case 'En progreso': return 'En progreso';
      case 'Completada': return 'Completada';
      default: return 'Sin estado';
    }
  }

  onEdit(): void {
    this.editTask.emit(this.task);
  }

  onDelete(): void {
    this.deleteTask.emit(this.task.taskId);
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.task);
  }

  getDaysUntilDue(): number {
    const dueDate = new Date(this.task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(): boolean {
    return this.getDaysUntilDue() < 0;
  }

  isDueSoon(): boolean {
    const daysUntilDue = this.getDaysUntilDue();
    return daysUntilDue >= 0 && daysUntilDue <= 3;
  }

  getAbsDaysUntilDue(): number {
    return Math.abs(this.getDaysUntilDue());
  }
}
