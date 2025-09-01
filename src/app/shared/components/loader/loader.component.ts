import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  @Input() message: string = 'Cargando...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() overlay: boolean = true;
  @Input() type: 'rings' | 'gradient' | 'dots' = 'rings';
}