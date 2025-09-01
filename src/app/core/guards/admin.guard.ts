import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('👑 AdminGuard: Inicializado');
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('👑 AdminGuard: Verificando permisos de admin...');
    
    if (!this.authService.isAuthenticated()) {
      console.log('❌ AdminGuard: Usuario no autenticado');
      return this.router.createUrlTree(['/auth/login']);
    }

    if (this.authService.isAdmin()) {
      console.log('✅ AdminGuard: Acceso de admin permitido');
      return true;
    }

    console.log('❌ AdminGuard: Sin permisos de admin, redirigiendo a employee');
    return this.router.createUrlTree(['/employee/dashboard']);
  }
}