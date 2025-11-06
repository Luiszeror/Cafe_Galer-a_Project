import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ AÑADIR ESTO
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css']
})
export class ConfiguracionComponent {
  establecimiento = {
    nombre: 'Café Galería',
    direccion: 'Calle del Arte, 123',
    telefono: '+34 123 456 789'
  };

  usuarios = [
    { nombre: 'Ana López', email: 'ana@cafe.com', rol: 'Administrador' },
    { nombre: 'Carlos Pérez', email: 'carlos@cafe.com', rol: 'Mesero' }
  ];

  guardarCambios() {
    alert('✅ Cambios guardados con éxito.');
  }

  agregarUsuario() {
    alert('🆕 Función para agregar usuario (por implementar)');
  }

  eliminarUsuario(usuario: any) {
    this.usuarios = this.usuarios.filter(u => u !== usuario);
  }
}
