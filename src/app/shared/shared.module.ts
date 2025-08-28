import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { LoaderComponent } from './components/loader/loader.component';
import { SearchComponent } from './components/search/search.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ModalComponent } from './components/modal/modal.component';



@NgModule({
  declarations: [
    HeaderComponent,
    LoaderComponent,
    SearchComponent,
    PaginationComponent,
    ModalComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
