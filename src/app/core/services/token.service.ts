import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'task_management_token';

  constructor() {

  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    console.log('🔑 Token guardado:', token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // Limpiar cualquier token residual con claves incorrectas
 
  }

  

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  }

  decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
      return null;
    }
  }

  getTokenExpiration(): number | null {
    const payload = this.decodeToken(this.getToken() || '');
    return payload?.exp || null;
  }

  clearAllTokens(): void {
    this.removeToken();
    console.log('🧹 Todos los tokens limpiados');
  }

  getUserRole(): string | null {
    const payload = this.decodeToken(this.getToken() || '');
    return payload?.role || null;
  }

  getUserId(): string | null {
    const payload = this.decodeToken(this.getToken() || '');
    return payload?.user_id || null;
  }
}