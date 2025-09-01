import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../../../../core/services/task.service';
import { EmployeeService, Employee } from '../../../../../core/services/employee.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  @Output() taskCreated = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  taskForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  employees: Employee[] = [];
  isLoading = false;
  errorMessage = '';
  employeesLoading = true;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private employeeService: EmployeeService
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      priority: ['Media', Validators.required],
      dueDate: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      assignedTo: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  /**
   * Cargar lista de empleados
   */
  loadEmployees(): void {
    this.employeesLoading = true;
    this.errorMessage = '';
    
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.employeesLoading = false;
        
        if (employees.length > 0) {
          // Solo establecer valor si no hay uno ya
          if (!this.taskForm.get('assignedTo')?.value) {
            this.taskForm.patchValue({ assignedTo: employees[0].userId });
          }
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.errorMessage = 'Error al cargar la lista de empleados';
        this.employeesLoading = false;
        this.employees = [];
      }
    });
  }

  get title() {
    return this.taskForm.get('title');
  }

  get description() {
    return this.taskForm.get('description');
  }

  get priority() {
    return this.taskForm.get('priority');
  }

  get dueDate() {
    return this.taskForm.get('dueDate');
  }

  get assignedTo() {
    return this.taskForm.get('assignedTo');
  }

  onSubmit(): void {
    if (this.taskForm.valid && this.employees.length > 0) {
      this.isLoading = true;
      this.errorMessage = '';

      const taskData = {
        title: this.taskForm.value.title,
        description: this.taskForm.value.description,
        status: 'Pendiente' as const,
        priority: this.taskForm.value.priority,
        dueDate: this.taskForm.value.dueDate,
        assignedTo: Number(this.taskForm.value.assignedTo)
      };

      this.taskService.createTask(taskData).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          this.isLoading = false;
          this.taskCreated.emit(response);
          this.resetForm();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error al crear la tarea';
          console.error('Error creating task:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.taskForm);
      if (this.employees.length === 0) {
        this.errorMessage = 'No hay empleados disponibles para asignar';
      }
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Resetear formulario
   */
  resetForm(): void {
    this.taskForm.reset({
      priority: 'Media',
      assignedTo: this.employees.length > 0 ? this.employees[0].userId : null
    });
  }

  // Métodos para las opciones de fecha rápida
  setToday(): void {
    const today = new Date();
    this.taskForm.patchValue({ dueDate: this.formatDateForInput(today) });
  }

  setTomorrow(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.taskForm.patchValue({ dueDate: this.formatDateForInput(tomorrow) });
  }

  setNextWeek(): void {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    this.taskForm.patchValue({ dueDate: this.formatDateForInput(nextWeek) });
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Método para formatear la fecha seleccionada
  formatSelectedDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    }
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    }
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('es-ES', options);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}