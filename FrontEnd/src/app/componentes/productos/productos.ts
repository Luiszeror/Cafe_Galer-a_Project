import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  activo: boolean;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class ProductosComponent {
  productos: Producto[] = [
    { id: 1, nombre: 'Café', precio: 3, activo: true },
    { id: 2, nombre: 'Pan', precio: 2, activo: false }
  ];

  displayedColumns = ['nombre', 'precio', 'descripcion', 'activo', 'acciones'];

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  productoSeleccionado: Producto | null = null;

  // Formulario
  productoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      descripcion: [''],
      activo: [true]
    });
  }

  abrirAgregar() {
    this.modoEdicion = false;
    this.productoSeleccionado = null;
    this.productoForm.reset({ nombre: '', precio: 0, descripcion: '', activo: true });
    this.mostrarModal = true;
  }

  abrirEditar(producto: Producto) {
    this.modoEdicion = true;
    this.productoSeleccionado = producto;
    this.productoForm.setValue({
      nombre: producto.nombre,
      precio: producto.precio,
      descripcion: producto.descripcion || '',
      activo: producto.activo || false
    });
    this.mostrarModal = true;
  }

  guardarProducto() {
    if (this.productoForm.invalid) return;

    const datos = this.productoForm.value;

    if (this.modoEdicion && this.productoSeleccionado) {
      const index = this.productos.findIndex(p => p.id === this.productoSeleccionado!.id);
      this.productos[index] = { ...this.productoSeleccionado, ...datos };
    } else {
      const nuevoProducto: Producto = { id: Date.now(), ...datos };
      this.productos.push(nuevoProducto);
    }

    this.cerrarModal();
  }

  eliminarProducto(producto: Producto) {
    this.productos = this.productos.filter(p => p.id !== producto.id);
  }

  toggleActivo(producto: Producto) {
    producto.activo = !producto.activo;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }
}
