import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Task, TaskUpdateData } from '../../../core/services/task.service';
import { EmployeeService, Employee } from '../../../core/services/employee.service';

@Component({
  selector: 'app-edit-task-modal',
  templateUrl: './edit-task-modal.component.html',
  styleUrls: ['./edit-task-modal.component.scss']
})
export class EditTaskModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() task: Task | null = null;
  @Input() loading: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() saveTask = new EventEmitter<{ taskId: number, taskData: TaskUpdateData }>();

  editForm: FormGroup;
  employees: Employee[] = [];
  loadingEmployees: boolean = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) {
    this.editForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnChanges(): void {
    if (this.task && this.isOpen) {
      this.populateForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      assignedTo: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      priority: ['', [Validators.required]]
    });
  }

  private populateForm(): void {
    if (this.task) {
      // Convertir la fecha ISO a formato date input (YYYY-MM-DD)
      const dueDate = new Date(this.task.dueDate);
      const formattedDate = dueDate.toISOString().split('T')[0];

      this.editForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        assignedTo: this.task.assignedTo,
        dueDate: formattedDate,
        priority: this.task.priority
      });
    }
  }

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
      }
    });
  }

  onSubmit(): void {
    if (this.editForm.valid && this.task) {
      const formValue = this.editForm.value;
      
      // Convertir la fecha del formulario al formato ISO esperado por la API
      const dueDate = new Date(formValue.dueDate + 'T12:00:00Z').toISOString();
      
      const taskData: TaskUpdateData = {
        title: formValue.title,
        description: formValue.description,
        assignedTo: parseInt(formValue.assignedTo),
        dueDate: dueDate,
        priority: formValue.priority
      };

      this.saveTask.emit({ taskId: this.task.taskId, taskData });
    }
  }

  onClose(): void {
    this.close.emit();
    this.editForm.reset();
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${requiredLength} caracteres`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'El título',
      description: 'La descripción',
      assignedTo: 'El empleado asignado',
      dueDate: 'La fecha de vencimiento',
      priority: 'La prioridad'
    };
    return labels[fieldName] || fieldName;
  }

  getEmployeeFullName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`;
  }

  getStatusColor(): string {
    if (!this.task) return '#6b7280';
    switch (this.task.status) {
      case 'Pendiente': return '#f59e0b';
      case 'En progreso': return '#3b82f6';
      case 'Completada': return '#10b981';
      default: return '#6b7280';
    }
  }

  getPriorityColor(): string {
    if (!this.task) return '#6b7280';
    switch (this.task.priority) {
      case 'Alta': return '#ef4444';
      case 'Media': return '#f59e0b';
      case 'Baja': return '#10b981';
      default: return '#6b7280';
    }
  }
}
