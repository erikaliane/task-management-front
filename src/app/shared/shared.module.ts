import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HeaderComponent } from './components/header/header.component';
import { ModalComponent } from './components/modal/modal.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SearchComponent } from './components/search/search.component';
import { LoaderComponent } from './components/loader/loader.component';
import { NotificationComponent } from './components/notification/notification.component';
import { TaskCardComponent } from './components/task-card/task-card.component';
import { TaskViewSelectorComponent } from './components/task-view-selector/task-view-selector.component';
import { TaskGridComponent } from './components/task-grid/task-grid.component';
import { TaskBoardComponent } from './components/task-board/task-board.component';
import { TaskTableComponent } from './components/task-table/task-table.component';
import { TaskCalendarComponent } from './components/task-calendar/task-calendar.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { EditTaskModalComponent } from './components/edit-task-modal/edit-task-modal.component';
import { TaskDetailsModalComponent } from './components/task-details-modal/task-details-modal.component';
import { CreateTaskModalComponent } from './components/create-task-modal/create-task-modal.component';

@NgModule({
  declarations: [
    HeaderComponent,
    ModalComponent,
    PaginationComponent,
    SearchComponent,
    LoaderComponent,
    NotificationComponent,
    TaskCardComponent,
    TaskViewSelectorComponent,
    TaskGridComponent,
    TaskBoardComponent,
    TaskTableComponent,
    TaskCalendarComponent,
    TaskListComponent,
    EditTaskModalComponent,
    TaskDetailsModalComponent,
    CreateTaskModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    DatePipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    ModalComponent,
    PaginationComponent,
    SearchComponent,
    LoaderComponent,
    NotificationComponent,
    TaskCardComponent,
    TaskViewSelectorComponent,
    TaskGridComponent,
    TaskBoardComponent,
    TaskTableComponent,
    TaskCalendarComponent,
    TaskListComponent,
    EditTaskModalComponent,
    TaskDetailsModalComponent,
    CreateTaskModalComponent
  ]
})
export class SharedModule { }