import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';
import { TokenService } from './token.service';

export interface TaskCreateData {
  title: string;
  description: string;
  priority: 'baja' | 'media' | 'alta';
  deadline: string;
  assignedTo: number;
}

export interface TaskUpdateData {
  title: string;
  description: string;
  assignedTo: number;
  dueDate: string;
  priority: 'Alta' | 'Media' | 'Baja';
}

export interface Task {
  taskId: number;
  title: string;
  description: string;
  status: 'Pendiente' | 'En progreso' | 'Completada';
  priority: 'Alta' | 'Media' | 'Baja';
  dueDate: string;
  assignedTo: number;
  createdAt: string;
  updatedAt: string;
  assignedFirstName: string;
  assignedLastName: string;
}

export interface TaskCreateRequest {
  title: string;
  description: string;
  status: 'Pendiente';
  priority: 'Alta' | 'Media' | 'Baja';
  dueDate: string;
  assignedTo: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private tokenService: TokenService
  ) {}

  /**
   * Crear nueva tarea
   */
  createTask(taskData: TaskCreateData): Observable<any> {
    const taskRequest = this.mapFormDataToCreateRequest(taskData);
    const headers = this.getAuthHeaders();
    
    return this.http.post<any>(this.apiUrl, taskRequest, { headers })
      .pipe(
        
        catchError(this.errorHandler.handleError('Ha ocurrido un error al crear la tarea'))
      );
  }

  /**
   * Obtener todas las tareas
   */
  getTasks(): Observable<Task[]> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<Task[]>(this.apiUrl, { headers })
      .pipe(
        catchError(this.errorHandler.handleError('Ha ocurrido un error al obtener las tareas'))
      );
  }

  /**
   * Eliminar tarea (soft delete)
   */
  deleteTask(taskId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.delete<any>(`${this.apiUrl}/${taskId}`, { headers })
      .pipe(
        catchError(this.errorHandler.handleError('Ha ocurrido un error al eliminar la tarea'))
      );
  }

  /**
   * Editar tarea (campos permitidos: title, description, assignedTo, dueDate, priority)
   */
  updateTask(taskId: number, taskData: TaskUpdateData): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log('🔄 Enviando datos de actualización:', { taskId, taskData });
    
    return this.http.put<any>(`${this.apiUrl}/${taskId}`, taskData, { headers })
      .pipe(
        catchError(this.errorHandler.handleError('Ha ocurrido un error al actualizar la tarea'))
      );
  }

  /**
   * Mapea los datos del formulario al formato de la API
   */
  private mapFormDataToCreateRequest(formData: TaskCreateData): TaskCreateRequest {
    const priorityMap: { [key: string]: 'Baja' | 'Media' | 'Alta' } = {
      'baja': 'Baja',
      'media': 'Media', 
      'alta': 'Alta'
    };

    const dueDate = new Date(formData.deadline + 'T12:00:00Z').toISOString();

    return {
      title: formData.title,
      description: formData.description,
      status: 'Pendiente',
      priority: priorityMap[formData.priority],
      dueDate: dueDate,
      assignedTo: formData.assignedTo
    };
  }

  /**
   * Crear headers con autorización
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}