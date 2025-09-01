import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyTasksComponent } from './my-tasks/my-tasks.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'my-tasks',
    pathMatch: 'full'
  },
  {
    path: 'my-tasks',
    component: MyTasksComponent,
    data: { title: 'Employee Tasks' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }