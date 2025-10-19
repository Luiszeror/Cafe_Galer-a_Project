import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  // 👉 Cambia esta URL por la de tu backend
  private apiUrl = 'http://localhost:5000/api/login';

  constructor(private http: HttpClient) {}

  onLogin() {
    console.log('Correo:', this.email);
    console.log('Contraseña:', this.password);

    const credentials = {
      email: this.email,
      password: this.password
    };

    // 🔹 Enviar los datos al backend
    this.http.post<any>(this.apiUrl, credentials).subscribe({
      next: (response) => {
        // Aquí manejas la respuesta del backend
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          alert('Inicio de sesión exitoso ✅');
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Respuesta inválida del servidor.';
        }
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.errorMessage = 'Credenciales incorrectas o error en el servidor ❌';
      }
    });
  }
}
