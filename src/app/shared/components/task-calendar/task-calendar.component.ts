import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { Task } from '../../../core/services/task.service';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  tasks: Task[];
  hasOverdue: boolean;
  hasDueSoon: boolean;
}

interface CalendarWeek {
  days: CalendarDay[];
}

interface TaskEvent {
  task: Task;
  isOverdue: boolean;
  isDueSoon: boolean;
  daysUntilDue: number;
}

@Component({
  selector: 'app-task-calendar',
  templateUrl: './task-calendar.component.html',
  styleUrls: ['./task-calendar.component.scss']
})
export class TaskCalendarComponent implements OnInit, OnChanges {
  @Input() tasks: Task[] = [];
  @Input() loading: boolean = false;
  @Input() showActions: boolean = true;
  @Input() hideAssignee: boolean = false;
  @Output() taskEdit = new EventEmitter<Task>();
  @Output() taskDelete = new EventEmitter<number>();
  @Output() taskView = new EventEmitter<Task>();
  @Output() dateClick = new EventEmitter<Date>();

  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  calendarWeeks: CalendarWeek[] = [];
  monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  dayNames: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // View modes for calendar
  calendarView: 'month' | 'week' | 'day' = 'month';
  selectedDateTasks: TaskEvent[] = [];
  showTaskDetails: boolean = false;

  ngOnInit(): void {
    this.generateCalendar();
  }

  ngOnChanges(): void {
    this.generateCalendar();
  }

  /**
   * Generate calendar structure for current month
   */
  private generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Get first day of month and calculate starting point
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    // Generate 6 weeks of calendar
    this.calendarWeeks = [];
    const currentIterDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const calendarWeek: CalendarWeek = { days: [] };
      
      for (let day = 0; day < 7; day++) {
        const calendarDay = this.createCalendarDay(currentIterDate, month);
        calendarWeek.days.push(calendarDay);
        currentIterDate.setDate(currentIterDate.getDate() + 1);
      }
      
      this.calendarWeeks.push(calendarWeek);
    }
  }

  /**
   * Create a calendar day with task information
   */
  private createCalendarDay(date: Date, currentMonth: number): CalendarDay {
    const dayTasks = this.getTasksForDate(date);
    const today = new Date();
    
    return {
      date: new Date(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === currentMonth,
      isToday: this.isSameDate(date, today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      tasks: dayTasks,
      hasOverdue: dayTasks.some(task => this.isTaskOverdue(task, date)),
      hasDueSoon: dayTasks.some(task => this.isTaskDueSoon(task, date))
    };
  }

  /**
   * Get tasks for a specific date
   */
  private getTasksForDate(date: Date): Task[] {
    return this.tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return this.isSameDate(taskDate, date);
    });
  }

  /**
   * Check if two dates are the same day (public for template use)
   */
  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  /**
   * Check if task is overdue on given date
   */
  private isTaskOverdue(task: Task, currentDate: Date): boolean {
    const taskDate = new Date(task.dueDate);
    return taskDate < currentDate && task.status !== 'Completada';
  }

  /**
   * Check if task is due soon (within 3 days)
   */
  private isTaskDueSoon(task: Task, currentDate: Date): boolean {
    const taskDate = new Date(task.dueDate);
    const diffTime = taskDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3 && task.status !== 'Completada';
  }

  /**
   * Navigation methods
   */
  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.generateCalendar();
  }

  /**
   * Event handlers
   */
  onDayClick(day: CalendarDay): void {
    this.selectedDate = day.date;
    this.selectedDateTasks = this.getTaskEventsForDate(day.date);
    this.showTaskDetails = day.tasks.length > 0;
    this.dateClick.emit(day.date);
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

  /**
   * Get task events with additional metadata
   */
  private getTaskEventsForDate(date: Date): TaskEvent[] {
    const dayTasks = this.getTasksForDate(date);
    return dayTasks.map(task => ({
      task,
      isOverdue: this.isTaskOverdue(task, date),
      isDueSoon: this.isTaskDueSoon(task, date),
      daysUntilDue: this.getDaysUntilDue(task.dueDate, date)
    }));
  }

  /**
   * Calculate days until due date
   */
  private getDaysUntilDue(dueDate: string, fromDate: Date = new Date()): number {
    const due = new Date(dueDate);
    const diffTime = due.getTime() - fromDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Utility methods for styling
   */
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
      case 'En Progreso': return '#3b82f6';
      case 'Completada': return '#10b981';
      default: return '#6b7280';
    }
  }

  /**
   * Get current month and year for display
   */
  get currentMonthYear(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  /**
   * Close task details panel
   */
  closeTaskDetails(): void {
    this.showTaskDetails = false;
    this.selectedDate = null;
    this.selectedDateTasks = [];
  }

  /**
   * Get task count for a specific day
   */
  getTaskCount(day: CalendarDay): number {
    return day.tasks.length;
  }

  /**
   * Get priority tasks count for a day
   */
  getHighPriorityCount(day: CalendarDay): number {
    return day.tasks.filter(task => task.priority === 'Alta').length;
  }
}
