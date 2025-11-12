import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  isCollapsed = true;
  showSidebar = true;

  constructor(private router: Router) {
    // Verificar inmediatamente la ruta actual al iniciar
    this.showSidebar = !this.router.url.includes('/login');

    // Suscribirse a los eventos de navegación
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showSidebar = !event.url.includes('/login');
      }
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    console.log('Cerrando sesión...');

    // 🔹 Limpiar completamente la sesión
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('userName');

    // 🔹 Redirigir al login
    this.router.navigate(['/login']).then(() => {
      // Evita que el usuario regrese con el botón "Atrás"
      window.location.replace('/login');
    });
  }
}
