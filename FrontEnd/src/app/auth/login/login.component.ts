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

  // URL del backend
  private apiUrl = 'https://backgaleriacafe.onrender.com/api/auth/login';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingresa correo y contraseña';
      return;
    }

    const credentials = { email: this.email.trim(), password: this.password };

    this.http.post<any>(this.apiUrl, credentials).subscribe({
      next: (response) => {
        console.log('🔹 Respuesta del backend:', response);

        // Validar la estructura esperada del backend
        if (response?.token && response?.user) {
          // ✅ Guardar token y datos de usuario
          localStorage.setItem('token', response.token);
          localStorage.setItem('rol', response.user.role || 'usuario');
          localStorage.setItem('userName', response.user.name || '');

          console.log('✅ Token guardado:', localStorage.getItem('token'));
          console.log('✅ Rol guardado:', localStorage.getItem('rol'));
          console.log('✅ Usuario guardado:', localStorage.getItem('userName'));

          alert(`Bienvenido ${response.user.name} ✅`);
          this.router.navigate(['/home']);
        } else {
          console.warn('⚠️ Respuesta inesperada del servidor:', response);
          this.errorMessage = 'Respuesta inválida del servidor.';
        }
      },
      error: (err) => {
        console.error('❌ Error en login backend:', err);

        if (err.error && err.error.msg) {
          this.errorMessage = err.error.msg;
        } else {
          this.errorMessage = 'Error desconocido al iniciar sesión.';
        }
      }
    });
  }
}
