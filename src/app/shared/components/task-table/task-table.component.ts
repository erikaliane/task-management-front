import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-table',
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.scss']
})
export class TaskTableComponent {
  @Input() tasks: Task[] = [];
  @Input() loading: boolean = false;
  @Output() taskEdit = new EventEmitter<Task>();
  @Output() taskDelete = new EventEmitter<number>();
  @Output() taskView = new EventEmitter<Task>();

  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  onTaskEdit(task: Task): void {
    this.taskEdit.emit(task);
  }

  onTaskDelete(taskId: number): void {
    this.taskDelete.emit(taskId);
  }

  onTaskView(task: Task): void {
    this.taskView.emit(task);
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    // Here you would emit a sort event to the parent component
    console.log('Sorting by:', column, this.sortDirection);
  }

  getPriorityColor(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'baja': return '#10b981';
      default: return '#6b7280';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pendiente': return '#f59e0b';
      case 'En progreso': return '#3b82f6';
      case 'Completada': return '#10b981';
      default: return '#6b7280';
    }
  }

  getDaysUntilDue(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(dueDate: string): boolean {
    return this.getDaysUntilDue(dueDate) < 0;
  }

  isDueSoon(dueDate: string): boolean {
    const days = this.getDaysUntilDue(dueDate);
    return days >= 0 && days <= 3;
  }
}
