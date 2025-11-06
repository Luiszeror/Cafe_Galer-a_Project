import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  // 👉 URL de tu backend
  private apiUrl = 'http://localhost:5000/api/login';

  // 🔹 Usuarios locales de prueba
  private mockUsers = [
    { email: 'admin@cafe.com', password: 'admin123', rol: 'Administrador' },
    { email: 'user@cafe.com', password: 'user123', rol: 'Usuario' }
  ];

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    console.log('Intentando iniciar sesión con:', this.email, this.password);

    const credentials = {
      email: this.email,
      password: this.password
    };

    // 🔹 Primero intenta con el backend real
    this.http.post<any>(this.apiUrl, credentials).subscribe({
      next: (response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          alert('Inicio de sesión exitoso con el servidor ✅');
          this.errorMessage = '';
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Respuesta inválida del servidor.';
        }
      },
      error: (err) => {
        console.warn('⚠️ Servidor no disponible, usando modo local.');
        console.error(err);

        // 🔹 Fallback local: intenta validar con usuarios de prueba
        const user = this.mockUsers.find(
          (u) => u.email === this.email && u.password === this.password
        );

        if (user) {
          localStorage.setItem('token', 'token-falso-local');
          localStorage.setItem('rol', user.rol);
          alert(`Inicio de sesión en modo local ✅ Bienvenido ${user.rol}`);
          this.errorMessage = '';
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Credenciales incorrectas ❌';
        }
      }
    });
  }
}
