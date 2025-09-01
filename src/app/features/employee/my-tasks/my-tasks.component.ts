import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService, Task, TaskCreateData } from '../../../core/services/task.service';
import { TokenService } from '../../../core/services/token.service';
import { NotificationService } from '../../../core/services/notification.service';

export type ViewMode = 'cards' | 'table' | 'board' | 'list' | 'calendar';

@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.scss']
})
export class MyTasksComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  
  loading = false;
  isModalVisible = false;
  isTaskDetailsModalVisible = false;
  isCreateTaskModalVisible = false;
  creatingTask = false;
  selectedTask: Task | null = null;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 8;
  searchQuery = '';

  // Task management
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  paginatedTasks: Task[] = [];
  currentViewMode: ViewMode = 'board'; // Changed from 'cards' to 'board' for employee

  // Statistics
  workspaceStats = {
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  };

  // Responsive items per page options
  get itemsPerPageOptions(): number[] {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      
      if (this.currentViewMode === 'table') {
        if (width >= 1400) {
          return [15, 25, 50, 75];
        } else if (width >= 1200) {
          return [12, 20, 40, 60];
        } else if (width >= 768) {
          return [8, 15, 25, 40];
        } else {
          return [5, 10, 15, 25];
        }
      } else if (this.currentViewMode === 'cards') {
        if (width >= 1400) {
          return [12, 24, 36, 48]; // 3-4 columns
        } else if (width >= 1200) {
          return [9, 18, 27, 36]; // 3 columns
        } else if (width >= 768) {
          return [6, 12, 18, 24]; // 2 columns
        } else {
          return [3, 6, 9, 12]; // 1 column
        }
      } else {
        // For board, list, calendar views
        if (width >= 1200) {
          return [10, 20, 30, 50];
        } else if (width >= 768) {
          return [8, 16, 24, 32];
        } else {
          return [5, 10, 15, 20];
        }
      }
    }
    return [8, 16, 24, 32];
  }

  // User profile for header
  userProfile = {
    name: 'Usuario',
    role: 'Empleado',
    avatar: 'https://res.cloudinary.com/dhfsbbos3/image/upload/v1711056243/CEEC/mvnegfqtwbqkjxtidtmx.png'
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private tokenService: TokenService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserTasks();
    this.setResponsiveItemsPerPage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.setResponsiveItemsPerPage();
    this.updatePaginatedTasks();
  }

  private setResponsiveItemsPerPage(): void {
    const newItemsPerPage = this.getResponsiveItemsPerPage();
    if (newItemsPerPage !== this.itemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
      this.currentPage = 1;
    }
  }

  private getResponsiveItemsPerPage(): number {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      
      if (this.currentViewMode === 'table') {
        if (width >= 1400) {
          return 20;
        } else if (width >= 1200) {
          return 15;
        } else if (width >= 768) {
          return 10;
        } else {
          return 8;
        }
      } else if (this.currentViewMode === 'cards') {
        if (width >= 1400) {
          return 12; // 4 columns x 3 rows
        } else if (width >= 1200) {
          return 9; // 3 columns x 3 rows
        } else if (width >= 768) {
          return 6; // 2 columns x 3 rows
        } else {
          return 3; // 1 column x 3 rows
        }
      } else {
        // For other views
        if (width >= 1200) {
          return 10;
        } else if (width >= 768) {
          return 8;
        } else {
          return 5;
        }
      }
    }
    return 8;
  }

  private loadUserProfile(): void {
    const payload = this.tokenService.decodeToken(this.tokenService.getToken() || '');
    if (payload) {
      // Better name handling for responsive display
      const firstName = payload.firstName || '';
      const lastName = payload.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      this.userProfile = {
        name: fullName || 'Usuario',
        role: 'Empleado',
        avatar: 'https://res.cloudinary.com/dhfsbbos3/image/upload/v1711056243/CEEC/mvnegfqtwbqkjxtidtmx.png'
      };
    }
  }

  loadUserTasks(): void {
    this.loading = true;
    const userId = this.tokenService.getUserId();
    
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      this.loading = false;
      return;
    }

    this.taskService.getUserTasks(Number(userId)).subscribe({
      next: (tasks) => {
        console.log('Tareas del usuario cargadas:', tasks);
        this.tasks = tasks || []; // Ensure we have an array
        this.updateFilteredTasks();
        this.updateTaskStats();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando tareas del usuario:', error);
        this.tasks = []; // Reset to empty array on error
        this.filteredTasks = [];
        this.paginatedTasks = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private updateFilteredTasks(): void {
    let filtered = [...this.tasks];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.status.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query)
      );
    }

    this.filteredTasks = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updatePaginatedTasks();
  }

  private updatePaginatedTasks(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTasks = this.filteredTasks.slice(startIndex, endIndex);
  }

  private updateTaskStats(): void {
    const pending = this.tasks.filter(task => task.status === 'Pendiente').length;
    const inProgress = this.tasks.filter(task => task.status === 'En progreso').length;
    const completed = this.tasks.filter(task => task.status === 'Completada').length;

    this.workspaceStats = {
      pendingTasks: pending,
      inProgressTasks: inProgress,
      completedTasks: completed
    };
  }

  // View mode methods
  onViewModeChange(viewMode: ViewMode): void {
    this.currentViewMode = viewMode;
    this.setResponsiveItemsPerPage();
    this.currentPage = 1;
    this.updatePaginatedTasks();
  }

  // Task viewing methods (read-only for employees)
  onViewTaskDetails(task: Task): void {
    this.selectedTask = task;
    this.isTaskDetailsModalVisible = true;
  }

  onCloseTaskDetailsModal(): void {
    this.isTaskDetailsModalVisible = false;
    this.selectedTask = null;
  }

  // Drag & Drop status update for employees
  onTaskStatusChange(event: {task: Task, newStatus: string}): void {
    console.log('🔄 Cambiando estado de tarea:', event);
    
    const { task, newStatus } = event;
    
    // Validate allowed status transitions
    const allowedStatuses = ['Pendiente', 'En progreso', 'Completada'];
    if (!allowedStatuses.includes(newStatus)) {
      console.error('Estado no válido:', newStatus);
      return;
    }

    this.taskService.updateTaskStatus(task.taskId, newStatus).subscribe({
      next: (response) => {
        console.log('✅ Estado actualizado exitosamente:', response);
        
        // Update the task in local array
        const taskIndex = this.tasks.findIndex(t => t.taskId === task.taskId);
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = { ...this.tasks[taskIndex], status: newStatus as 'Pendiente' | 'En progreso' | 'Completada' };
          this.updateFilteredTasks();
          this.updateTaskStats();
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('❌ Error actualizando estado:', error);
        // Optionally show error notification
      }
    });
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedTasks();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.updatePaginatedTasks();
  }

  // Search methods
  onHeaderSearch(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
    this.updateFilteredTasks();
  }

  refreshWorkspace(): void {
    this.loadUserTasks();
  }

  // Utility methods
  getTotalTasks(): number {
    return this.tasks.length;
  }

  getCompletionPercentage(): number {
    if (this.tasks.length === 0) return 0;
    return Math.round((this.workspaceStats.completedTasks / this.tasks.length) * 100);
  }

  getOverdueTasks(): number {
    const today = new Date();
    return this.tasks.filter(task => 
      task.status !== 'Completada' && 
      new Date(task.dueDate) < today
    ).length;
  }

  getHighPriorityTasks(): number {
    return this.tasks.filter(task => 
      task.priority === 'Alta' && 
      task.status !== 'Completada'
    ).length;
  }

  getTasksDueSoon(): number {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.tasks.filter(task => 
      task.status !== 'Completada' && 
      new Date(task.dueDate) >= today && 
      new Date(task.dueDate) <= nextWeek
    ).length;
  }

  // Task creation methods
  onCreateTask(): void {
    this.isCreateTaskModalVisible = true;
  }

  onCloseCreateTaskModal(): void {
    this.isCreateTaskModalVisible = false;
    this.creatingTask = false;
  }

  onCreateTaskSubmit(taskData: TaskCreateData): void {
    this.creatingTask = true;
    
    this.taskService.createTask(taskData).subscribe({
      next: (response) => {
        console.log('✅ Tarea creada exitosamente:', response);
        this.isCreateTaskModalVisible = false;
        this.creatingTask = false;
        
        // Show success notification
        this.notificationService.showSuccess(
          'Tarea creada',
          `La tarea "${taskData.title}" se ha creado exitosamente`
        );
        
        // Reload tasks to show the new one
        this.loadUserTasks();
      },
      error: (error) => {
        console.error('❌ Error al crear la tarea:', error);
        this.creatingTask = false;
        
        // Handle validation errors from API
        if (error.status === 400 && error.error) {
          const errorMessage = this.parseValidationErrors(error.error);
          this.notificationService.showError(
            'Error de validación',
            errorMessage
          );
        } else if (error.status === 401) {
          this.notificationService.showError(
            'Error de autorización',
            'No tienes permisos para crear tareas'
          );
        } else if (error.status === 500) {
          this.notificationService.showError(
            'Error del servidor',
            'Ha ocurrido un error interno. Intenta nuevamente'
          );
        } else {
          this.notificationService.showError(
            'Error al crear tarea',
            'Ha ocurrido un error inesperado. Intenta nuevamente'
          );
        }
      }
    });
  }

  /**
   * Parse validation errors from API response
   */
  private parseValidationErrors(errorData: any): string {
    if (typeof errorData === 'string') {
      return errorData;
    }
    
    if (errorData.errors) {
      const errorMessages = Object.values(errorData.errors).flat();
      return errorMessages.join('. ');
    }
    
    if (errorData.message) {
      return errorData.message;
    }
    
    return 'Los datos ingresados no son válidos';
  }

  // Authentication methods
  onLogout(): void {
    this.isModalVisible = true;
  }

  onModalClose(): void {
    this.isModalVisible = false;
  }

  onConfirmLogout(): void {
    this.authService.logout();
    this.isModalVisible = false;
  }

  onProfileClick(): void {
    console.log('Perfil clickeado');
  }
}
