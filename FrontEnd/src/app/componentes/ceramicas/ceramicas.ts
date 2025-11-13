import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Ceramica {
  _id?: string;
  name: string;
  price: number;
  description?: string;
  active: boolean;
  imgUrl?: string; // Base64
}

@Component({
  selector: 'app-ceramicas',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
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
export class CeramicasComponent implements OnInit {
  ceramicas: Ceramica[] = [];
  mostrarModal = false;
  modoEdicion = false;
  ceramicaSeleccionada: Ceramica | null = null;

  ceramicaForm: FormGroup;
  private URL_BACKEND = 'http://localhost:4000/api/ceramics';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.ceramicaForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      active: [true],
      imgUrl: ['']
    });
  }

  ngOnInit() {
    this.cargarCeramicas();
  }

  // --- CRUD ---
  cargarCeramicas() {
    this.http.get<Ceramica[]>(this.URL_BACKEND)
      .pipe(catchError(err => {
        console.warn('No se pudo cargar desde backend, fallback vacío', err);
        return of([]);
      }))
      .subscribe(data => this.ceramicas = data);
  }

  abrirAgregar() {
    this.modoEdicion = false;
    this.ceramicaSeleccionada = null;
    this.ceramicaForm.reset({ name: '', price: 0, description: '', active: true, imgUrl: '' });
    this.mostrarModal = true;
  }

  abrirEditar(ceramica: Ceramica) {
    this.modoEdicion = true;
    this.ceramicaSeleccionada = ceramica;
    this.ceramicaForm.patchValue(ceramica);
    this.mostrarModal = true;
  }

  guardarCeramica() {
    if (this.ceramicaForm.invalid) return;
    const datos: Ceramica = this.ceramicaForm.value;

    if (this.modoEdicion && this.ceramicaSeleccionada?._id) {
      this.http.put<Ceramica>(`${this.URL_BACKEND}/${this.ceramicaSeleccionada._id}`, datos).subscribe({
        next: () => this.cargarCeramicas(),
        error: err => console.error('Error actualizando:', err)
      });
    } else {
      this.http.post<Ceramica>(this.URL_BACKEND, datos).subscribe({
        next: () => this.cargarCeramicas(),
        error: err => console.error('Error creando:', err)
      });
    }

    this.cerrarModal();
  }

  eliminarCeramica(ceramica: Ceramica) {
    if (!ceramica._id) return;
    this.http.delete(`${this.URL_BACKEND}/${ceramica._id}`).subscribe({
      next: () => this.cargarCeramicas(),
      error: err => console.error('Error eliminando:', err)
    });
  }

  toggleActivo(ceramica: Ceramica) {
    ceramica.active = !ceramica.active;
    if (ceramica._id) {
      this.http.put(`${this.URL_BACKEND}/${ceramica._id}`, ceramica).subscribe();
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  // --- Manejo de imagen Base64 ---
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onImagenDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.leerImagen(event.dataTransfer.files[0]);
    }
  }

  onImagenSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.leerImagen(input.files[0]);
  }

  leerImagen(file: File) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      // Tamaño final cuadrado
      const SIZE = 800;
      
      // Tomar la menor dimensión para recortar
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;   // Coordenada X para recorte
      const sy = (img.height - minDim) / 2;  // Coordenada Y para recorte

      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Dibujar la sección recortada redimensionada al tamaño final
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, SIZE, SIZE);
      }

      // Convertir a Base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Calidad 0.7
      this.ceramicaForm.patchValue({ imgUrl: dataUrl });
    };
    img.src = event.target?.result as string;
  };
  reader.readAsDataURL(file);
}

}
