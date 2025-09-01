import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';

import {  UserRole } from '../models/auth.model';
import { TokenService } from './token.service';


import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
private readonly API_URL = environment.API_URL;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((response: any) => {
        this.tokenService.setToken(response.token);
        this.redirectByRole();
      }),
      catchError((error) => {
        console.error('❌ Error en login:', error);
        return throwError(() => new Error('Error de autenticación'));
      })
    );
  }

  logout(): void {
    this.tokenService.removeToken();
    this.router.navigate(['/auth/login']);
    console.log('🚪 Sesión cerrada');
  }

  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid();
  }

 

  isAdmin(): boolean {
    const role = this.tokenService.getUserRole();
    const isAdminUser = role === UserRole.ADMIN;
    console.log('👑 ¿Es admin?', isAdminUser);
    return isAdminUser;
  }

  isEmployee(): boolean {
    const role = this.tokenService.getUserRole();
    const isEmployeeUser = role === UserRole.EMPLOYEE;
    console.log('👤 ¿Es employee?', isEmployeeUser);
    return isEmployeeUser;
  }


  redirectByRole(): void {
    const role = this.tokenService.getUserRole();
    if (role === 'Admin') {
      this.router.navigate(['/admin/workspace']);
    } else if (role === 'Employee') {
      this.router.navigate(['/employee/my-tasks']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  handleTokenExpiration(): void {
    if (!this.isAuthenticated()) {
      this.logout();
    }
  }
}