import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('👤 EmployeeGuard: Inicializado');
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('👤 EmployeeGuard: Verificando permisos de employee...');
    
    if (!this.authService.isAuthenticated()) {
      console.log('❌ EmployeeGuard: Usuario no autenticado');
      return this.router.createUrlTree(['/auth/login']);
    }

    if (this.authService.isEmployee()) {
      console.log('✅ EmployeeGuard: Acceso de employee permitido');
      return true;
    }

    console.log('❌ EmployeeGuard: Sin permisos de employee, redirigiendo a admin');
    return this.router.createUrlTree(['/admin/dashboard']);
  }
}