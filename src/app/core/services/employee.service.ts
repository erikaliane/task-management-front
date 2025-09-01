import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

export interface Employee {
  userId: number;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root'
})

export class EmployeeService {
  private readonly apiUrl = `${environment.apiUrl}/profile/employee-profiles`;

  

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private tokenService: TokenService
  ) {}

  /**
   * Obtener lista de empleados
   */
  getEmployees(): Observable<Employee[]> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<Employee[]>(this.apiUrl, { headers })
      .pipe(
        catchError(this.errorHandler.handleError('Error al cargar empleados'))
      );
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