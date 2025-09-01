import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  /**
   * Manejo genérico de errores HTTP
   */
  handleError(defaultMessage: string = 'Ha ocurrido un error') {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage = defaultMessage;

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Datos inválidos. Por favor, revisa la información.';
            break;
          case 401:
            errorMessage = 'No tienes autorización para realizar esta acción.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
            break;
          default:
            errorMessage = `Error del servidor: ${error.status}`;
        }
      }

      console.error('HTTP Error:', error);
      return throwError(() => new Error(errorMessage));
    };
  }
}