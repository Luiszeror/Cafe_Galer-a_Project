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

  // URL de tu backend
  private apiUrl = 'http://localhost:4000/api/auth/login';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingresa correo y contraseña';
      return;
    }

    const credentials = { email: this.email, password: this.password };

    this.http.post<any>(this.apiUrl, credentials).subscribe({
      next: (response) => {
        if (response && response.token && response.user) {
          // Guardar token y rol
          localStorage.setItem('token', response.token);
          localStorage.setItem('rol', response.user.role);
          localStorage.setItem('userName', response.user.name);

          alert(`Bienvenido ${response.user.name} ✅`);
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Respuesta inválida del servidor.';
        }
      },
      error: (err) => {
        console.error('Error en login backend:', err);

        // Si el backend envía un mensaje de error
        if (err.error && err.error.msg) {
          this.errorMessage = err.error.msg;
        } else {
          this.errorMessage = 'Error desconocido al iniciar sesión.';
        }
      }
    });
  }
}
