import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { LoginRequest, LoginResponse, User, UserRole } from '../models/auth.model'; // ← Importar UserRole
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private testUsers = {
    'admin@test.com': {
      password: 'Admin123!',
      user: {
        id: 1,
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN  
      }
    },
    'employee@test.com': {
      password: 'Employee123!',
      user: {
        id: 2,
        email: 'employee@test.com',
        firstName: 'Employee',
        lastName: 'User',
        role: UserRole.EMPLOYEE  
      }
    }
  };

  constructor(private tokenService: TokenService) {
    console.log('🔐 AuthService: Servicio inicializado');
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🚀 Intentando login con:', { email: credentials.email, password: '***' });
    
    const userData = this.testUsers[credentials.email as keyof typeof this.testUsers];
    
    if (userData && userData.password === credentials.password) {
      // Login exitoso
      const token = `fake-jwt-token-${Date.now()}`;
      const response: LoginResponse = {
        token,
        user: userData.user,
        message: 'Login exitoso'
      };

      console.log('✅ Login exitoso:', response.user);
      return of(response).pipe(delay(1000)); // Simular latencia
    } else {
      // Login fallido
      console.log('❌ Credenciales inválidas');
      return throwError(() => new Error('Credenciales inválidas')).pipe(delay(1000));
    }
  }

  isAuthenticated(): boolean {
    const isAuth = this.tokenService.isTokenValid();
    console.log('🔍 ¿Está autenticado?', isAuth);
    return isAuth;
  }

  // Método adicional para verificar rol
  isAdmin(user: User): boolean {
    return user.role === UserRole.ADMIN;
  }

  isEmployee(user: User): boolean {
    return user.role === UserRole.EMPLOYEE;
  }
}