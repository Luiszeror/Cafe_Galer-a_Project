import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Ceramica {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  activo: boolean;
  imagen?: string; // Para mostrar imagen en la tarjeta
}

@Component({
  selector: 'app-ceramicas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './ceramicas.html',
  styleUrls: ['./ceramicas.css']
})
export class CeramicasComponent {
  ceramicas: Ceramica[] = [
    { id: 1, nombre: 'Vasija', precio: 15, descripcion: 'Hecha a mano', activo: true, imagen: 'https://via.placeholder.com/150' },
    { id: 2, nombre: 'Jarrón', precio: 25, descripcion: 'Decorativo', activo: false, imagen: 'https://via.placeholder.com/150' }
  ];

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  ceramicaSeleccionada: Ceramica | null = null;

  // Formulario
  ceramicaForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.ceramicaForm = this.fb.group({
      nombre: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      descripcion: [''],
      activo: [true],
      imagen: [''] // Nueva propiedad para imagen
    });
  }

  abrirAgregar() {
    this.modoEdicion = false;
    this.ceramicaSeleccionada = null;
    this.ceramicaForm.reset({ nombre: '', precio: 0, descripcion: '', activo: true, imagen: '' });
    this.mostrarModal = true;
  }

  abrirEditar(ceramica: Ceramica) {
    this.modoEdicion = true;
    this.ceramicaSeleccionada = ceramica;
    this.ceramicaForm.setValue({
      nombre: ceramica.nombre,
      precio: ceramica.precio,
      descripcion: ceramica.descripcion || '',
      activo: ceramica.activo || false,
      imagen: ceramica.imagen || ''
    });
    this.mostrarModal = true;
  }

  guardarCeramica() {
    if (this.ceramicaForm.invalid) return;
    const datos = this.ceramicaForm.value;

    if (this.modoEdicion && this.ceramicaSeleccionada) {
      const index = this.ceramicas.findIndex(c => c.id === this.ceramicaSeleccionada!.id);
      this.ceramicas[index] = { ...this.ceramicaSeleccionada, ...datos };
    } else {
      const nuevaCeramica: Ceramica = { id: Date.now(), ...datos };
      this.ceramicas.push(nuevaCeramica);
    }

    this.cerrarModal();
  }

  eliminarCeramica(ceramica: Ceramica) {
    this.ceramicas = this.ceramicas.filter(c => c.id !== ceramica.id);
  }

  toggleActivo(ceramica: Ceramica) {
    ceramica.activo = !ceramica.activo;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  // --- Funciones para imagen drag & drop ---
  onDragOver(event: DragEvent) {
    event.preventDefault(); // Permite drop
  }

  onImagenDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      this.leerImagen(file);
    }
  }

  onImagenSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.leerImagen(file);
    }
  }

  leerImagen(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.ceramicaForm.patchValue({ imagen: reader.result });
    };
    reader.readAsDataURL(file);
  }
}
