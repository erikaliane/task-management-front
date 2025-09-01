import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() userProfile: any = {};
  @Input() showSearch: boolean = true;
  @Input() showNotifications: boolean = true;
  @Output() onSearch = new EventEmitter<string>();
  @Output() onLogout = new EventEmitter<void>();
  @Output() onProfileClick = new EventEmitter<void>();

  searchTerm: string = '';
  showUserMenu: boolean = false;
  notificationCount: number = 3;

  ngOnInit(): void {}

  onSearchChange(): void {
    this.onSearch.emit(this.searchTerm);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.showUserMenu = false;
    this.onLogout.emit();
  }

  viewProfile(): void {
    this.showUserMenu = false;
    this.onProfileClick.emit();
  }
}