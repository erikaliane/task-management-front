import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  /**
   * Mostrar notificación de éxito
   */
  showSuccess(title: string, message: string, duration: number = 3000): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }

  /**
   * Mostrar notificación de error
   */
  showError(title: string, message: string, persistent: boolean = false): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      duration: persistent ? 0 : 5000,
      persistent
    });
  }

  /**
   * Mostrar notificación de advertencia
   */
  showWarning(title: string, message: string, duration: number = 4000): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  /**
   * Mostrar notificación de información
   */
  showInfo(title: string, message: string, duration: number = 3000): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }

  /**
   * Remover notificación
   */
  removeNotification(id: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
  }

  /**
   * Limpiar todas las notificaciones
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  private addNotification(notification: Omit<Notification, 'id'>): void {
    const id = this.generateId();
    const newNotification: Notification = { ...notification, id };
    
    const notifications = [...this.notificationsSubject.value, newNotification];
    this.notificationsSubject.next(notifications);

    // Auto-remove si no es persistente
    if (!notification.persistent && notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.duration);
    }
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}