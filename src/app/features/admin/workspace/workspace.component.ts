import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ModalComponent } from './../../../shared/components/modal/modal.component'; // Asegúrate de que la ruta sea la correcta
import { TaskService, Task, TaskUpdateData, TaskCreateData } from '../../../core/services/task.service';
import { TaskFormComponent } from './components/task-form/task-form.component';

export type ViewMode = 'cards' | 'table' | 'board' | 'list' | 'calendar';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  
  @ViewChild('taskModal') taskModal!: ModalComponent; // Referencia al modal usando el identificador #taskModal
  @ViewChild(TaskFormComponent) taskFormComponent!: TaskFormComponent;

  private destroy$ = new Subject<void>();
  
  loading = false;
  deletingTask = false; // 👈 Loading específico para eliminación
  editingTask = false; // 👈 Loading específico para edición
  isModalVisible = false;
  isTaskModalVisible = false; // 👈 Nuevo modal para tareas
  isDeleteModalVisible = false; // 👈 Nuevo modal para confirmar eliminación
  isEditModalVisible = false; // 👈 Nuevo modal para editar tarea
  taskToDelete: number | null = null; // 👈 ID de la tarea a eliminar
  taskToEdit: Task | null = null; // 👈 Tarea a editar
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 8; // Default for large screens (2 rows x 4 columns)
  searchQuery = '';

  // Task management
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  paginatedTasks: Task[] = [];
  currentViewMode: ViewMode = 'cards';

  // Responsive items per page options
  get itemsPerPageOptions(): number[] {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      
      // Different options for different views
      if (this.currentViewMode === 'table') {
        if (width >= 1200) {
          return [10, 15, 25, 50]; // Table view options for large screens
        } else if (width >= 768) {
          return [8, 12, 20, 30]; // Table view options for medium screens
        } else {
          return [5, 8, 12, 20]; // Table view options for small screens
        }
      } else { // cards view
        if (width >= 1200) {
          return [8, 16, 24, 32]; // Large screens
        } else if (width >= 768) {
          return [6, 12, 18, 24]; // Medium screens
        } else {
          return [3, 6, 9, 12]; // Small screens
        }
      }
    }
    return [8, 16, 24, 32]; // Default
  }

  // Get responsive items per page
  private getResponsiveItemsPerPage(): number {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      
      // Different pagination for different views
      if (this.currentViewMode === 'table') {
        if (width >= 1200) {
          return 15; // More items in table view
        } else if (width >= 768) {
          return 10;
        } else {
          return 8;
        }
      } else { // cards view
        if (width >= 1200) {
          return 8; // Large screens: 2 rows x 4 columns
        } else if (width >= 768) {
          return 6; // Medium screens: 2 rows x 3 columns
        } else {
          return 3; // Small screens: 1 column
        }
      }
    }
    return 8; // Default
  }

  // User profile para el header
  userProfile = {
    name: 'Erika Liane',
    email: 'erikaliane@empresa.com',
    role: 'Admin',
    avatar: 'https://res.cloudinary.com/dhfsbbos3/image/upload/v1711056243/CEEC/mvnegfqtwbqkjxtidtmx.png'
  };

  // Datos del workspace (se actualizan dinámicamente)
  workspaceStats = {
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  };


constructor(private authService: AuthService, private cdr: ChangeDetectorRef, private taskService: TaskService) {}
  
  ngOnInit(): void {
    console.log('Workspace loaded!');
    this.setResponsiveItemsPerPage();
    this.loadTasks();
  }

  private setResponsiveItemsPerPage(): void {
    const responsiveItemsPerPage = this.getResponsiveItemsPerPage();
    if (this.itemsPerPage !== responsiveItemsPerPage) {
      this.itemsPerPage = responsiveItemsPerPage;
      this.currentPage = 1; // Reset to first page when changing items per page
    }
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

  // ===== TASK MANAGEMENT METHODS =====
  
  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filteredTasks = [...tasks];
        this.totalItems = tasks.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.updatePaginatedTasks();
        this.updateTaskStats();
        this.loading = false;
        console.log('✅ Tareas cargadas:', tasks);
      },
      error: (error) => {
        console.error('❌ Error al cargar las tareas:', error);
        this.loading = false;
      }
    });
  }

  updatePaginatedTasks(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTasks = this.filteredTasks.slice(startIndex, endIndex);
  }

  updateTaskStats(): void {
    const pending = this.tasks.filter(task => task.status === 'Pendiente').length;
    const inProgress = this.tasks.filter(task => task.status === 'En progreso').length;
    const completed = this.tasks.filter(task => task.status === 'Completada').length;

    this.workspaceStats = {
      pendingTasks: pending,
      inProgressTasks: inProgress,
      completedTasks: completed
    };
  }

  onViewModeChange(viewMode: ViewMode): void {
    this.currentViewMode = viewMode;
    console.log('Vista cambiada a:', viewMode);
    
    // Adjust items per page based on view mode
    this.setResponsiveItemsPerPage();
    this.currentPage = 1; // Reset to first page
    this.updatePaginatedTasks();
  }

  onEditTask(task: Task): void {
    console.log('Editando tarea:', task);
    this.taskToEdit = task;
    this.isEditModalVisible = true;
  }

  onDeleteTask(taskId: number): void {
    console.log('Solicitando eliminación de tarea:', taskId);
    this.taskToDelete = taskId;
    this.isDeleteModalVisible = true;
  }

  onConfirmDeleteTask(): void {
    if (this.taskToDelete !== null) {
      this.deletingTask = true;
      
      this.taskService.deleteTask(this.taskToDelete).subscribe({
        next: (response) => {
          console.log('✅ Tarea eliminada exitosamente:', response);
          
          // Remover la tarea de las listas locales
          this.tasks = this.tasks.filter(task => task.taskId !== this.taskToDelete);
          this.filteredTasks = this.filteredTasks.filter(task => task.taskId !== this.taskToDelete);
          
          // Actualizar estadísticas y paginación
          this.totalItems = this.filteredTasks.length;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          
          // Si estamos en la última página y ya no hay elementos, ir a la página anterior
          if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
          }
          
          this.updatePaginatedTasks();
          this.updateTaskStats();
          this.deletingTask = false;
          
          // Cerrar modal y resetear
          this.isDeleteModalVisible = false;
          this.taskToDelete = null;
          
          // Mostrar notificación de éxito
          this.showSuccessNotification('Tarea eliminada exitosamente');
        },
        error: (error) => {
          console.error('❌ Error al eliminar la tarea:', error);
          this.deletingTask = false;
          this.isDeleteModalVisible = false;
          this.taskToDelete = null;
          alert('Error al eliminar la tarea. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }

  onCancelDeleteTask(): void {
    this.isDeleteModalVisible = false;
    this.taskToDelete = null;
  }

  onSaveEditTask(event: { taskId: number, taskData: any }): void {
    this.editingTask = true;
    
    this.taskService.updateTask(event.taskId, event.taskData).subscribe({
      next: (response) => {
        console.log('✅ Tarea actualizada exitosamente:', response);
        
        // Actualizar la tarea en las listas locales
        const taskIndex = this.tasks.findIndex(task => task.taskId === event.taskId);
        if (taskIndex !== -1) {
          // Mantener los campos no editables y actualizar solo los editables
          this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            title: event.taskData.title,
            description: event.taskData.description,
            assignedTo: event.taskData.assignedTo,
            dueDate: event.taskData.dueDate,
            priority: event.taskData.priority,
            updatedAt: new Date().toISOString()
          };
        }
        
        // Actualizar listas filtradas y paginadas
        this.filteredTasks = [...this.tasks];
        this.updatePaginatedTasks();
        
        // Cerrar modal y limpiar estado
        this.isEditModalVisible = false;
        this.taskToEdit = null;
        this.editingTask = false;
       
      },
      error: (error) => {
        console.error('❌ Error al actualizar la tarea:', error);
        this.editingTask = false;
        alert('Error al actualizar la tarea. Por favor, inténtalo de nuevo.');
      }
    });
  }

  onCloseEditModal(): void {
    this.isEditModalVisible = false;
    this.taskToEdit = null;
  }

  onViewTaskDetails(task: Task): void {
    console.log('Viendo detalles de tarea:', task);
    // Implementar lógica de vista de detalles
  }

  onTaskStatusChange(event: {task: Task, newStatus: string}): void {
    console.log('Cambiando estado de tarea:', event.task.taskId, 'a', event.newStatus);
    // Aquí puedes implementar la lógica para actualizar el estado en el backend
    // Por ahora solo actualizamos localmente
    const taskIndex = this.tasks.findIndex(t => t.taskId === event.task.taskId);
    if (taskIndex !== -1) {
      // Validate the status is one of the allowed values
      const validStatuses: ('Pendiente' | 'En progreso' | 'Completada')[] = ['Pendiente', 'En progreso', 'Completada'];
      const newStatus = validStatuses.find(status => status === event.newStatus);
      
      if (newStatus) {
        this.tasks[taskIndex].status = newStatus;
        this.filteredTasks = [...this.tasks];
        this.updatePaginatedTasks();
        this.updateTaskStats();
      }
    }
  }

  onCalendarDateClick(date: Date): void {
    console.log('Fecha seleccionada en calendario:', date);
    // Aquí puedes implementar lógica adicional cuando se selecciona una fecha
    // Por ejemplo, filtrar tareas por fecha o mostrar un modal de creación de tarea
  }

  // ===== TASK MODAL METHODS =====
  
  
  createNewTask(): void {
    console.log('🎯 Abriendo modal de nueva tarea...');
    this.isTaskModalVisible = true;
  }

  onTaskFormSubmit(): void {
    if (this.taskFormComponent && this.taskFormComponent.taskForm) {
      if (this.taskFormComponent.taskForm.valid) {
        const taskData = {
          title: this.taskFormComponent.taskForm.value.title,
          description: this.taskFormComponent.taskForm.value.description,
          status: 'Pendiente' as const,
          priority: this.taskFormComponent.taskForm.value.priority,
          dueDate: this.taskFormComponent.taskForm.value.dueDate,
          assignedTo: Number(this.taskFormComponent.taskForm.value.assignedTo)
        };

        this.taskService.createTask(taskData).subscribe({
          next: (response) => {
            console.log('✅ Tarea creada exitosamente:', response);
            this.loadTasks(); // Recargar las tareas
            this.onTaskModalClose();
          },
          error: (error) => {
            console.error('❌ Error al crear la tarea:', error);
          }
        });
      } else {
        console.error('❌ El formulario de tarea no es válido.');
        this.taskFormComponent.taskForm.markAllAsTouched();
      }
    } else {
      console.error('❌ No se encontró el formulario de tarea.');
    }
  }

  onTaskModalClose(): void {
    console.log('🔒 Cerrando modal de tarea');
    this.isTaskModalVisible = false;
  }

  onTaskCreated(taskData: TaskCreateData): void {
    console.log('✅ Creando nueva tarea:', taskData);
    this.loading = true;
    
    this.taskService.createTask(taskData).subscribe({
      next: (response) => {
        console.log('✅ Tarea creada exitosamente:', response);
        this.isTaskModalVisible = false;
        this.loading = false;
        
        // Reload tasks to show the new one
        this.loadTasks();
        
        // Show success notification
        this.showSuccessNotification('Tarea creada exitosamente');
      },
      error: (error) => {
        console.error('❌ Error al crear la tarea:', error);
        this.loading = false;
        
        // Handle validation errors from API
        if (error.status === 400 && error.error) {
          console.error('Errores de validación:', error.error);
          this.showErrorNotification('Error de validación: Revisa los campos del formulario');
        } else {
          this.showErrorNotification('Error al crear la tarea. Inténtalo de nuevo.');
        }
      }
    });
  }



  onTaskFormCancel(): void {
    console.log('❌ Creación de tarea cancelada');
    this.isTaskModalVisible = false;
  }



  private showSuccessNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="success-content">
        <div class="success-icon">✓</div>
        <div class="success-text">
          <h3>¡Éxito!</h3>
          <p>${message}</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Remover notificación después de 4 segundos con animación
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  private showErrorNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="material-icons">error</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
          <span class="material-icons">close</span>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Remover notificación después de 5 segundos con animación
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  // ===== LOGOUT MODAL METHODS =====
  
  onLogout(): void {
    this.isModalVisible = true;
  }

  onConfirmLogout(): void {
    this.isModalVisible = false;
    console.log('🚪 Usuario cerrando sesión...');
    this.authService.logout();
  }

  onModalClose(): void {
    this.isModalVisible = false;
  }

  onModalCancel(): void {
    this.isModalVisible = false;
  }

  // ===== OTHER METHODS =====
  
  onSearch(query: string): void {
    this.searchQuery = query;
    console.log('Search triggered for:', query);
    this.filterTasks();
  }

  filterTasks(): void {
    if (this.searchQuery.trim()) {
      this.filteredTasks = this.tasks.filter(task => 
        task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        task.assignedFirstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        task.assignedLastName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredTasks = [...this.tasks];
    }
    
    this.totalItems = this.filteredTasks.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page after search
    this.updatePaginatedTasks();
  }

  simulateSearchResults(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      console.log('Search results loaded');
    }, 1000);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedTasks();
    console.log('Page changed to:', page);
    // Scroll to top of tasks section
    document.querySelector('.tasks-content')?.scrollIntoView({ behavior: 'smooth' });
  }

  onItemsPerPageChange(newItemsPerPage: number): void {
    this.itemsPerPage = newItemsPerPage;
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updatePaginatedTasks();
    console.log('Items per page changed to:', newItemsPerPage);
  }

  onHeaderSearch(searchTerm: string): void {
    this.searchQuery = searchTerm;
    console.log('Header search:', searchTerm);
    this.filterTasks();
  }

  onProfileClick(): void {
    console.log('Profile clicked');
  }

  refreshWorkspace(): void {
    console.log('Refreshing workspace...');
    this.loadTasks();
  }

  getTotalTasks(): number {
    return this.tasks.length;
  }

  getCompletionPercentage(): number {
    if (this.tasks.length === 0) return 0;
    const completed = this.tasks.filter(task => task.status === 'Completada').length;
    return Math.round((completed / this.tasks.length) * 100);
  }

  getOverdueTasks(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && task.status !== 'Completada';
    }).length;
  }

  getHighPriorityTasks(): number {
    return this.tasks.filter(task => 
      task.priority === 'Alta' && task.status !== 'Completada'
    ).length;
  }

  getTasksDueSoon(): number {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    return this.tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= threeDaysFromNow && task.status !== 'Completada';
    }).length;
  }
}

