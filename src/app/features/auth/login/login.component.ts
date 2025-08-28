import { Component, OnInit, OnDestroy ,  ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None // 👈 Esto fuerza los estilos
})

export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  errorMessage = '';
  focusedField = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.loginForm = this.createForm();
  }

  ngOnInit(): void {
    // Auto-focus en el campo email
    setTimeout(() => {
      const emailInput = document.getElementById('email');
      emailInput?.focus();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.valid) {
      this.loading = true;
      
      this.authService.login(this.loginForm.value)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: (response) => {
            console.log('✅ Login exitoso:', response);
            this.tokenService.setToken(response.token);
            
            // Micro-interacción de éxito
            this.showSuccessMessage(response.user.firstName, response.user.role);
            
            // Redirigir después de mostrar el mensaje
            setTimeout(() => {
              this.router.navigate(['/tasks']);
            }, 1500);
          },
          error: (error) => {
            console.error('❌ Error de login:', error);
            this.errorMessage = 'Credenciales incorrectas. Por favor, verifica tu información.';
            this.shakeForm();
          }
        });
    } else {
      this.markFormGroupTouched();
      this.shakeForm();
    }
  }

  private showSuccessMessage(firstName: string, role: string): void {
    // Crear notificación temporal de éxito
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.innerHTML = `
      <div class="success-content">
        <div class="success-icon">✓</div>
        <div class="success-text">
          <h3>¡Bienvenido!</h3>
          <p>${firstName} • ${role}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Remover después de 2 segundos
    setTimeout(() => {
      document.body.removeChild(successDiv);
    }, 2000);
  }

  private shakeForm(): void {
    const loginCard = document.querySelector('.login-card');
    loginCard?.classList.add('shake-animation');
    setTimeout(() => {
      loginCard?.classList.remove('shake-animation');
    }, 600);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  fillTestData(userType: 'admin' | 'employee'): void {
    const testUsers = {
      admin: { email: 'admin@test.com', password: 'Admin123!' },
      employee: { email: 'employee@test.com', password: 'Employee123!' }
    };
    
    this.loginForm.patchValue(testUsers[userType]);
    this.errorMessage = '';
    
    // Micro-interacción al llenar datos
    const form = document.querySelector('form');
    form?.classList.add('data-filled');
    setTimeout(() => {
      form?.classList.remove('data-filled');
    }, 500);
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    
    if (control?.hasError('required')) {
      return `${field === 'email' ? 'Email' : 'Contraseña'} es requerido`;
    }
    
    if (control?.hasError('email')) {
      return 'Formato de email inválido';
    }
    
    if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    
    return '';
  }

  onFieldFocus(fieldName: string): void {
    this.focusedField = fieldName;
  }

  onFieldBlur(): void {
    this.focusedField = '';
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.valid && field.touched : false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
}