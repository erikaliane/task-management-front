import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing.module';
import { MyTasksComponent } from './my-tasks/my-tasks.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    MyTasksComponent
  ],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    SharedModule
  ]
})
export class EmployeeModule { }
