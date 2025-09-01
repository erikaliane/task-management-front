import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../../core/services/task.service';

export type ViewMode = 'cards' | 'table' | 'board' | 'list' | 'calendar';

@Component({
  selector: 'app-task-view-selector',
  templateUrl: './task-view-selector.component.html',
  styleUrls: ['./task-view-selector.component.scss']
})
export class TaskViewSelectorComponent {
  @Input() currentView: ViewMode = 'cards';
  @Output() viewChange = new EventEmitter<ViewMode>();

  viewOptions = [
    { value: 'cards' as ViewMode, label: 'Tarjetas', icon: 'view_module' },
    { value: 'table' as ViewMode, label: 'Tabla', icon: 'table_chart' },
    { value: 'board' as ViewMode, label: 'Tablero', icon: 'dashboard' },
    { value: 'list' as ViewMode, label: 'Lista', icon: 'format_list_bulleted' },
    { value: 'calendar' as ViewMode, label: 'Calendario', icon: 'calendar_month' }
  ];

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    this.viewChange.emit(view);
  }
}
