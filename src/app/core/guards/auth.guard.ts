import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('🛡️ AuthGuard: Inicializado');
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('🛡️ AuthGuard: Verificando autenticación...');
    
    if (this.authService.isAuthenticated()) {
      console.log('✅ AuthGuard: Usuario autenticado');
      return true;
    }

    console.log('❌ AuthGuard: Usuario no autenticado, redirigiendo a login');
    return this.router.createUrlTree(['/auth/login']);
  }
}