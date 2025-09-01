import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent  {
  @Input() taskTitle!: string;

  /**
   * Método para copiar la URL al portapapeles
   */
  copyURL(): void {
    navigator.clipboard.writeText(`https://workspace-url/tasks/${this.taskTitle}`).then(() => {
      alert('URL copiada al portapapeles');
    });
  }
}