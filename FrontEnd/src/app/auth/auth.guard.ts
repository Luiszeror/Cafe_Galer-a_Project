import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('token');

    if (token) {
      // ✅ Token existe, permitir acceso
      return true;
    } else {
      alert('⚠️ Debes iniciar sesión para acceder a esta página');
      return this.router.parseUrl('/login');
    }
  }
}
