import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { Task } from '../../../core/services/task.service';

interface BoardColumn {
  status: string;
  title: string;
  color: string;
  tasks: Task[];
}

@Component({
  selector: 'app-task-board',
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss']
})
export class TaskBoardComponent implements OnInit, OnChanges {
  @Input() tasks: Task[] = [];
  @Input() loading: boolean = false;
  @Input() showActions: boolean = true;
  @Input() hideAssignee: boolean = false;
  @Output() taskEdit = new EventEmitter<Task>();
  @Output() taskDelete = new EventEmitter<number>();
  @Output() taskView = new EventEmitter<Task>();
  @Output() taskStatusChange = new EventEmitter<{task: Task, newStatus: string}>();

  // Drag & Drop state
  private draggedTask: Task | null = null;

  columns: BoardColumn[] = [
    {
      status: 'Pendiente',
      title: 'Pendientes',
      color: '#f59e0b',
      tasks: []
    },
    {
      status: 'En progreso',
      title: 'En progreso',
      color: '#3b82f6',
      tasks: []
    },
    {
      status: 'Completada',
      title: 'Completadas',
      color: '#10b981',
      tasks: []
    }
  ];

  ngOnInit(): void {
    this.organizeTasks();
  }

  ngOnChanges(): void {
    this.organizeTasks();
  }

  private organizeTasks(): void {
    // Reset all columns
    this.columns.forEach(column => column.tasks = []);
    
    // Organize tasks by status
    this.tasks.forEach(task => {
      const column = this.columns.find(col => col.status === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });
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

  onTaskDrop(event: any, targetStatus: string): void {
    event.preventDefault();
    
    if (this.draggedTask && this.draggedTask.status !== targetStatus) {
      console.log('🎯 Dropping task:', this.draggedTask.title, 'to status:', targetStatus);
      
      // Emit the status change event
      this.taskStatusChange.emit({
        task: this.draggedTask,
        newStatus: targetStatus
      });
    }
    
    this.draggedTask = null;
  }

  onTaskDragStart(event: any, task: Task): void {
    console.log('🎯 Drag started for task:', task.title);
    this.draggedTask = task;
    
    // Set drag effect
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
    
    // Add visual feedback
    event.target.style.opacity = '0.5';
  }

  onDragEnd(event: any): void {
    // Reset visual feedback
    event.target.style.opacity = '1';
  }

  onDragOver(event: any): void {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  getPriorityColor(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'baja': return '#10b981';
      default: return '#6b7280';
    }
  }

  getTaskCount(status: string): number {
    const column = this.columns.find(col => col.status === status);
    return column ? column.tasks.length : 0;
  }
}
