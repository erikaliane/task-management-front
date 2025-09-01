import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-grid',
  templateUrl: './task-grid.component.html',
  styleUrls: ['./task-grid.component.scss']
})
export class TaskGridComponent {
  @Input() tasks: Task[] = [];
  @Input() loading: boolean = false;
  @Input() showActions: boolean = true;
  @Input() hideAssignee: boolean = false;
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<number>();
  @Output() viewDetails = new EventEmitter<Task>();

  onEditTask(task: Task): void {
    this.editTask.emit(task);
  }

  onDeleteTask(taskId: number): void {
    this.deleteTask.emit(taskId);
  }

  onViewDetails(task: Task): void {
    this.viewDetails.emit(task);
  }

  trackByTaskId(index: number, task: Task): number {
    return task.taskId;
  }
}
