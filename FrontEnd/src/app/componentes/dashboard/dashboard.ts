import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  isSidebarCollapsed = false;

  // Este método se puede conectar más adelante con el sidebar real
  onSidebarToggle(state: boolean) {
    this.isSidebarCollapsed = state;
  }
}
