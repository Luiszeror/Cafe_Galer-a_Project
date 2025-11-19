import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, of } from 'rxjs';

interface Usuario {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'empleado';
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css']
})
export class ConfiguracionComponent implements OnInit {
  establecimiento = {
    nombre: 'Café Galería',
    direccion: 'Calle del Arte, 123',
    telefono: '+34 123 456 789'
  };

  usuarios: Usuario[] = [];

  // Datos del formulario
  nuevoUsuario: Usuario = { name: '', email: '', password: '', role: 'empleado' };
  confirmPassword: string = ''; // confirmación de contraseña

  private URL_REGISTER = 'https://backgaleriacafe.onrender.com/api/auth/register';
  private URL_USERS = 'https://backgaleriacafe.onrender.com/api/auth/users';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  guardarCambios() {
    alert('✅ Cambios guardados con éxito.');
  }

  // --- Traer usuarios existentes ---
  cargarUsuarios() {
    this.http.get<Usuario[]>(this.URL_USERS)
      .pipe(
        catchError(err => {
          console.error('Error al cargar usuarios', err);
          return of([]);
        })
      )
      .subscribe(data => {
        this.usuarios = data;
      });
  }

  // --- Agregar usuario ---
  agregarUsuario(form: NgForm) {
    if (form.invalid) {
      alert('❌ Por favor completa todos los campos.');
      return;
    }

    if (this.nuevoUsuario.password !== this.confirmPassword) {
      alert('❌ Las contraseñas no coinciden.');
      return;
    }

    this.http.post<{ user: Usuario }>(this.URL_REGISTER, this.nuevoUsuario)
      .pipe(
        catchError(err => {
          console.error('Error al crear usuario', err);
          alert('❌ Error al crear usuario');
          return of(null);
        })
      )
      .subscribe(res => {
        if (res?.user) {
          this.usuarios.push({
            _id: res.user._id,
            name: res.user.name,
            email: res.user.email,
            role: res.user.role
          });
          alert('✅ Usuario agregado con éxito. Todos los campos son válidos.');
          // Limpiar formulario
          this.nuevoUsuario = { name: '', email: '', password: '', role: 'empleado' };
          this.confirmPassword = '';
          form.resetForm();
        }
      });
  }

  // --- Eliminar usuario (solo local, se puede conectar con backend) ---
  // --- Eliminar usuario ---
eliminarUsuario(usuario: Usuario) {
  if (!usuario._id) return; // asegurarnos que tenga id

  if (!confirm(`❌ ¿Estás seguro que quieres eliminar a ${usuario.name}?`)) return;

  this.http.delete<{ msg: string }>(`https://backgaleriacafe.onrender.com/api/auth/users/${usuario._id}`)
    .pipe(
      catchError(err => {
        console.error('Error al eliminar usuario', err);
        alert('❌ No se pudo eliminar el usuario.');
        return of(null);
      })
    )
    .subscribe(res => {
      if (res) {
        this.usuarios = this.usuarios.filter(u => u._id !== usuario._id);
        alert(`✅ Usuario ${usuario.name} eliminado correctamente.`);
      }
    });
}

}
