import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskCreateData } from '../../../core/services/task.service';
import { TokenService } from '../../../core/services/token.service';
import { EmployeeService, Employee } from '../../../core/services/employee.service';

@Component({
  selector: 'app-create-task-modal',
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.scss']
})
export class CreateTaskModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() loading: boolean = false;
  @Input() showAssigneeField: boolean = false; // Para controlar si mostrar campo de responsable
  @Output() close = new EventEmitter<void>();
  @Output() createTask = new EventEmitter<TaskCreateData>();

  createForm: FormGroup;
  minDate: string;
  maxDate: string;
  employees: Employee[] = [];
  loadingEmployees: boolean = false;

  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService,
    private employeeService: EmployeeService
  ) {
    this.createForm = this.createFormGroup();
    
    // Set min date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    // Set max date to 1 year from now
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    this.maxDate = maxDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    if (this.showAssigneeField) {
      this.loadEmployees();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showAssigneeField'] && this.showAssigneeField) {
      this.loadEmployees();
      // Recreate form to include/exclude assignedTo field
      this.createForm = this.createFormGroup();
    }
  }

  private createFormGroup(): FormGroup {
    const formConfig: any = {
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['Media', Validators.required], // Por defecto 'Media'
      dueDate: ['', Validators.required] // Cambiado de 'deadline' a 'dueDate'
    };

    // Only add assignedTo field if we need to show it (Admin mode)
    if (this.showAssigneeField) {
      formConfig.assignedTo = ['', Validators.required];
    }

    return this.fb.group(formConfig);
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      const formData = this.createForm.value;
      
      const taskData: TaskCreateData = {
        title: formData.title,
        description: formData.description,
        status: 'Pendiente', // Por defecto siempre 'Pendiente'
        priority: formData.priority,
        dueDate: formData.dueDate, // Cambiado de 'deadline' a 'dueDate'
        // If no assignedTo is selected (Employee mode), use current user
        assignedTo: formData.assignedTo || this.getCurrentUserId()
      };

      this.createTask.emit(taskData);
    } else {
      this.markFormGroupTouched();
    }
  }

  private getCurrentUserId(): number {
    const userId = this.tokenService.getUserId();
    return userId ? parseInt(userId, 10) : 0;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createForm.controls).forEach(key => {
      const control = this.createForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private resetForm(): void {
    this.createForm.reset({
      title: '',
      description: '',
      priority: 'medium',
      deadline: '',
      assignedTo: ''
    });
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string | null {
    const field = this.createForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${requiredLength} caracteres`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'El título',
      description: 'La descripción',
      priority: 'La prioridad',
      deadline: 'La fecha límite',
      assignedTo: 'El empleado asignado'
    };
    return labels[fieldName] || fieldName;
  }

  // Load employees for assignment
  private loadEmployees(): void {
    this.loadingEmployees = true;
    
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.loadingEmployees = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loadingEmployees = false;
        this.employees = [];
      }
    });
  }

  getEmployeeFullName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`;
  }

  // Date helper methods
  setDate(type: 'today' | 'tomorrow' | 'nextWeek'): void {
    const today = new Date();
    let targetDate: Date;

    switch (type) {
      case 'today':
        targetDate = today;
        break;
      case 'tomorrow':
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 1);
        break;
      case 'nextWeek':
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 7);
        break;
    }

    const formattedDate = targetDate.toISOString().split('T')[0];
    this.createForm.patchValue({ deadline: formattedDate });
  }

  isToday(): boolean {
    if (!this.dueDate?.value) return false;
    const selectedDate = new Date(this.dueDate.value);
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  }

  isTomorrow(): boolean {
    if (!this.dueDate?.value) return false;
    const selectedDate = new Date(this.dueDate.value);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return selectedDate.toDateString() === tomorrow.toDateString();
  }

  isNextWeek(): boolean {
    if (!this.dueDate?.value) return false;
    const selectedDate = new Date(this.dueDate.value);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return selectedDate.toDateString() === nextWeek.toDateString();
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Getters for easy access in template
  get title() { return this.createForm.get('title'); }
  get description() { return this.createForm.get('description'); }
  get priority() { return this.createForm.get('priority'); }
  get dueDate() { return this.createForm.get('dueDate'); }
  get assignedTo() { return this.createForm.get('assignedTo'); }
}
