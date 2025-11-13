import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Producto {
  _id?: string;
  name: string;
  price: number;
  description?: string;
  active: boolean;
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
export class ProductosComponent implements OnInit {

  productos: Producto[] = [];
  displayedColumns = ['name', 'price', 'description', 'active', 'acciones'];
  mostrarModal = false;
  modoEdicion = false;
  productoSeleccionado: Producto | null = null;
  productoForm: FormGroup;

  private URL_BACKEND = 'http://localhost:4000/api/products';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.productoForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      active: [true]
    });
  }

  ngOnInit() {
    this.cargarProductos();
  }

  // 🔁 Cargar todos los productos del backend
  cargarProductos() {
    this.http.get<Producto[]>(this.URL_BACKEND)
      .pipe(
        catchError(err => {
          console.warn('⚠️ No se pudo conectar con el backend:', err);
          return of([]);
        })
      )
      .subscribe(data => {
        this.productos = data;
      });
  }

  // 🧱 Abrir modal para crear
  abrirAgregar() {
    this.modoEdicion = false;
    this.productoSeleccionado = null;
    this.productoForm.reset({ name: '', price: 0, description: '', active: true });
    this.mostrarModal = true;
  }

  // ✏️ Abrir modal para editar
  abrirEditar(producto: Producto) {
    this.modoEdicion = true;
    this.productoSeleccionado = producto;
    this.productoForm.setValue({
      name: producto.name,
      price: producto.price,
      description: producto.description || '',
      active: producto.active
    });
    this.mostrarModal = true;
  }

  // 💾 Guardar cambios
  guardarProducto() {
    if (this.productoForm.invalid) return;

    const datos = this.productoForm.value;

    if (this.modoEdicion && this.productoSeleccionado) {
      // 🔹 PUT
      this.http.put<Producto>(`${this.URL_BACKEND}/${this.productoSeleccionado._id}`, datos)
        .subscribe({
          next: () => {
            this.cargarProductos(); // 🔁 Recarga lista completa
            this.cerrarModal();
          },
          error: err => console.error('Error actualizando producto:', err)
        });
    } else {
      // 🔹 POST
      this.http.post<Producto>(this.URL_BACKEND, datos)
        .subscribe({
          next: () => {
            this.cargarProductos(); // 🔁 Recarga lista completa
            this.cerrarModal();
          },
          error: err => console.error('Error creando producto:', err)
        });
    }
  }

  // ❌ Eliminar
  eliminarProducto(producto: Producto) {
    if (!producto._id) return;
    this.http.delete(`${this.URL_BACKEND}/${producto._id}`)
      .subscribe({
        next: () => {
          this.cargarProductos(); // 🔁 Recarga automática
        },
        error: err => console.error('Error eliminando producto:', err)
      });
  }

  // 🟢 Toggle activo/inactivo
  toggleActivo(producto: Producto) {
    if (!producto._id) return;
    const nuevoEstado = !producto.active;
    this.http.put<Producto>(`${this.URL_BACKEND}/${producto._id}`, { active: nuevoEstado })
      .subscribe({
        next: () => {
          this.cargarProductos(); // 🔁 Refresca tabla automáticamente
        },
        error: err => console.error('Error cambiando estado:', err)
      });
  }

  cerrarModal() {
    this.mostrarModal = false;
  }
}
