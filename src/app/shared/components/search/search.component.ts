import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'dateRange' | 'checkbox';
  placeholder?: string;
  options?: FilterOption[];
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;

  @Input() placeholder: string = 'Buscar...';
  @Input() debounceTime: number = 300;
  @Input() showAdvancedFilters: boolean = false;
  @Input() filters: FilterConfig[] = [];
  @Input() showClearButton: boolean = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() onSearch = new EventEmitter<string>();
  @Output() onFilter = new EventEmitter<Record<string, any>>();
  @Output() onClear = new EventEmitter<void>();

  searchTerm: string = '';
  showFilters: boolean = false;
  selectedFilters: Record<string, any> = {};
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.onSearch.emit(searchTerm);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onClear.emit();
    this.onSearch.emit('');
    this.searchInput.nativeElement.focus();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.onFilter.emit(this.selectedFilters);
    this.showFilters = false;
  }

  resetFilters(): void {
    this.selectedFilters = {};
    this.onFilter.emit({});
  }

  focusSearch(): void {
    this.searchInput.nativeElement.focus();
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.selectedFilters).some(key => 
      this.selectedFilters[key] !== undefined && 
      this.selectedFilters[key] !== '' && 
      this.selectedFilters[key] !== null
    );
  }

  getActiveFilters(): ActiveFilter[] {
    const activeFilters: ActiveFilter[] = [];
    
    Object.keys(this.selectedFilters).forEach(key => {
      const value = this.selectedFilters[key];
      if (value !== undefined && value !== '' && value !== null) {
        const filter = this.filters.find(f => 
          f.key === key || 
          key.startsWith(f.key + '_')
        );
        
        if (filter) {
          let displayValue = value;
          
          // Para filtros de tipo select, buscar la etiqueta
          if (filter.type === 'select' && filter.options) {
            const option = filter.options.find(opt => opt.value === value);
            if (option) {
              displayValue = option.label;
            }
          }
          
          activeFilters.push({
            key: key,
            label: filter.label,
            value: displayValue
          });
        }
      }
    });
    
    return activeFilters;
  }

  removeFilter(key: string): void {
    delete this.selectedFilters[key];
    this.onFilter.emit(this.selectedFilters);
  }
}