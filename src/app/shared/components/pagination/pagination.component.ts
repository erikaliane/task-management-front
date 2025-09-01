import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() totalPages: number = 0; // Nueva propiedad agregada
  @Input() itemsPerPage: number = 10;
  @Input() itemsPerPageOptions: number[] = [6, 12, 18, 24]; // Puede ser sobrescrito desde el padre
  @Input() maxVisiblePages: number = 5;
  @Input() showFirstLast: boolean = true;
  @Input() showPrevNext: boolean = true;
  @Input() showInfo: boolean = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  visiblePages: number[] = [];
  calculatedTotalPages: number = 0;

  ngOnInit(): void {
    this.calculatePagination();
  }

  ngOnChanges(): void {
    this.calculatePagination();
  }

  calculatePagination(): void {
    // Si se proporciona totalPages directamente, usarlo
    // Si no, calcularlo basado en totalItems e itemsPerPage
    if (this.totalPages > 0) {
      this.calculatedTotalPages = this.totalPages;
    } else if (this.totalItems > 0) {
      this.calculatedTotalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    } else {
      this.calculatedTotalPages = 0;
    }
    
    this.calculateVisiblePages();
  }

  calculateVisiblePages(): void {
    if (this.calculatedTotalPages === 0) return;

    const half = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.calculatedTotalPages, start + this.maxVisiblePages - 1);

    if (end - start + 1 < this.maxVisiblePages) {
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }

    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.calculatedTotalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  goToFirst(): void {
    this.goToPage(1);
  }

  goToLast(): void {
    this.goToPage(this.calculatedTotalPages);
  }

  goToPrevious(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToNext(): void {
    this.goToPage(this.currentPage + 1);
  }

  onItemsPerPageChange(newItemsPerPage: number): void {
    this.itemsPerPageChange.emit(newItemsPerPage);
  }

  getStartItem(): number {
    if (this.totalItems > 0) {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    }
    // Si no hay totalItems pero hay totalPages, hacer una estimación
    if (this.totalPages > 0) {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    }
    return 0;
  }

  getEndItem(): number {
    if (this.totalItems > 0) {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    }
    // Si no hay totalItems pero hay totalPages, hacer una estimación
    if (this.totalPages > 0) {
      const estimatedTotalItems = this.totalPages * this.itemsPerPage;
      return Math.min(this.currentPage * this.itemsPerPage, estimatedTotalItems);
    }
    return 0;
  }

  getTotalItems(): number {
    return this.totalItems > 0 ? this.totalItems : (this.totalPages * this.itemsPerPage);
  }
}