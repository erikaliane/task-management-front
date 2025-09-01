import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../../core/services/task.service';

interface GroupedTasks {
  [key: string]: Task[];
}

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Input() loading: boolean = false;
  @Output() taskEdit = new EventEmitter<Task>();
  @Output() taskDelete = new EventEmitter<number>();
  @Output() taskView = new EventEmitter<Task>();

  // Grouping options
  groupBy: 'status' | 'priority' | 'assignee' | 'dueDate' | 'none' = 'status';
  sortBy: 'dueDate' | 'priority' | 'title' | 'status' = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'asc';

  get groupedTasks(): GroupedTasks {
    if (this.groupBy === 'none') {
      return { 'Todas las tareas': this.sortedTasks };
    }

    return this.groupTasksBy(this.groupBy);
  }

  get sortedTasks(): Task[] {
    return [...this.tasks].sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
          comparison = priorityOrder[b.priority as keyof typeof priorityOrder] - 
                      priorityOrder[a.priority as keyof typeof priorityOrder];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  private groupTasksBy(groupBy: string): GroupedTasks {
    const grouped: GroupedTasks = {};

    this.sortedTasks.forEach(task => {
      let groupKey = '';
      
      switch (groupBy) {
        case 'status':
          groupKey = task.status;
          break;
        case 'priority':
          groupKey = `Prioridad ${task.priority}`;
          break;
        case 'assignee':
          groupKey = `${task.assignedFirstName} ${task.assignedLastName}`;
          break;
        case 'dueDate':
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            groupKey = 'Vencidas';
          } else if (diffDays === 0) {
            groupKey = 'Vencen hoy';
          } else if (diffDays <= 7) {
            groupKey = 'Esta semana';
          } else if (diffDays <= 30) {
            groupKey = 'Este mes';
          } else {
            groupKey = 'Más adelante';
          }
          break;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(task);
    });

    return grouped;
  }

  onTaskEdit(task: Task): void {
    this.taskEdit.emit(task);
  }

  onTaskDelete(taskId: number): void {
    this.taskDelete.emit(taskId);
  }

  onTaskView(task: Task): void {
    this.taskView.emit(task);
  }

  onGroupByChange(groupBy: any): void {
    this.groupBy = groupBy;
  }

  onSortByChange(sortBy: any): void {
    this.sortBy = sortBy;
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
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

  getGroupIcon(groupKey: string): string {
    if (groupKey.includes('Prioridad')) return 'flag';
    if (groupKey.includes('Pendiente')) return 'schedule';
    if (groupKey.includes('En progreso')) return 'play_circle';
    if (groupKey.includes('Completada')) return 'check_circle';
    if (groupKey.includes('Vencidas')) return 'error';
    if (groupKey.includes('hoy')) return 'today';
    if (groupKey.includes('semana')) return 'date_range';
    if (groupKey.includes('mes')) return 'calendar_month';
    return 'folder';
  }

  getGroupColor(groupKey: string): string {
    if (groupKey.includes('Vencidas')) return '#ef4444';
    if (groupKey.includes('hoy')) return '#f59e0b';
    if (groupKey.includes('semana')) return '#3b82f6';
    if (groupKey.includes('Alta')) return '#ef4444';
    if (groupKey.includes('Media')) return '#f59e0b';
    if (groupKey.includes('Baja')) return '#10b981';
    if (groupKey.includes('Completada')) return '#10b981';
    if (groupKey.includes('En Progreso')) return '#3b82f6';
    if (groupKey.includes('Pendiente')) return '#f59e0b';
    return '#6b7280';
  }
}
