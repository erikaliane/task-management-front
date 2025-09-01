import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  
})
export class ModalComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @ViewChild('modalFooter', { static: false }) modalFooter!: ElementRef;

  @Input() visible: boolean = false;
  @Input() title: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showCloseButton: boolean = true;
  @Input() closeOnBackdropClick: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() showConfirmButton: boolean = true;
  @Input() showCancelButton: boolean = true;
  @Input() compact: boolean = false; // Nueva propiedad para modo compacto
  
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  private hasCustomFooterContent: boolean = false;

  ngOnInit(): void {
    this.updateBodyClass();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkCustomFooterContent();
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
  }

  ngOnChanges(): void {
    this.updateBodyClass();
  }

  private updateBodyClass(): void {
    if (this.visible) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  private checkCustomFooterContent(): void {
    if (this.modalFooter) {
      const footerSlotContent = this.modalFooter.nativeElement.querySelector('[slot="footer"]');
      this.hasCustomFooterContent = footerSlotContent && footerSlotContent.innerHTML.trim().length > 0;
    }
  }

  closeModal(): void {
    this.visible = false;
    this.close.emit();
  }

  confirmAction(): void {
    this.confirm.emit();
  }

  cancelAction(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdropClick && event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  hasCustomFooter(): boolean {
    return this.hasCustomFooterContent;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.visible && this.showCloseButton) {
      this.closeModal();
    }
  }

  // Método para forzar el cierre del modal

  forceClose(): void {
  this.visible = false;
  this.updateBodyClass();
  this.close.emit(); // Emitir el evento de cierre
}

  // Método para obtener las clases CSS del contenedor
  getContainerClasses(): string {
    let classes = `modal-${this.size}`;
    if (this.compact) {
      classes += ' modal-compact';
    }
    return classes;
  }
}