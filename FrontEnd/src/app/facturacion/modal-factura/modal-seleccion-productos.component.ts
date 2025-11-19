import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

// Interfaces que coinciden con tu backend
interface Producto {
  _id?: string;
  name: string;
  price: number;
  description?: string;
  active: boolean;
  cantidad?: number;
}

interface Ceramica {
  _id?: string;
  name: string;
  price: number;
  description?: string;
  active: boolean;
  imgUrl?: string;
  cantidad?: number;
}

@Component({
  selector: 'app-modal-seleccion-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <div class="modal-productos">
      <div class="header">
        <h2>{{ data.tipo }} - Mesa {{ data.mesa }}</h2>
        <button class="close-btn" (click)="cerrar()">✕</button>
      </div>

      <div class="contenido">
        <!-- Vista de PRODUCTOS (Cafetería) -->
        <div *ngIf="data.tipo === 'Cafetería'" class="lista-productos">
          <div *ngFor="let producto of productos" class="producto-item">
            <div class="info">
              <span class="nombre">{{ producto.name }}</span>
              <span class="precio">{{ producto.price | currency:'USD':'symbol':'1.0-0' }}</span>
              <span class="descripcion" *ngIf="producto.description">{{ producto.description }}</span>
            </div>
            <div class="controles">
              <button (click)="decrementar(producto)" [disabled]="!producto.cantidad || producto.cantidad === 0">-</button>
              <input 
                type="number" 
                [(ngModel)]="producto.cantidad" 
                min="0"
                (change)="validarCantidad(producto)"
              >
              <button (click)="incrementar(producto)">+</button>
            </div>
          </div>
          <p *ngIf="productos.length === 0" class="mensaje-vacio">
            {{ cargando ? 'Cargando productos...' : 'No hay productos disponibles' }}
          </p>
        </div>

        <!-- Vista de CERÁMICAS -->
        <div *ngIf="data.tipo === 'Cerámicas'" class="grid-ceramicas">
          <div *ngFor="let ceramica of ceramicas" class="ceramica-card">
            <img [src]="ceramica.imgUrl || 'https://via.placeholder.com/200x200?text=Sin+Imagen'" [alt]="ceramica.name">
            <div class="ceramica-info">
              <h4>{{ ceramica.name }}</h4>
              <p class="precio">{{ ceramica.price | currency:'USD':'symbol':'1.0-0' }}</p>
              <p class="descripcion" *ngIf="ceramica.description">{{ ceramica.description }}</p>
            </div>
            <div class="controles">
              <button (click)="decrementar(ceramica)" [disabled]="!ceramica.cantidad || ceramica.cantidad === 0">-</button>
              <input 
                type="number" 
                [(ngModel)]="ceramica.cantidad" 
                min="0"
                (change)="validarCantidad(ceramica)"
              >
              <button (click)="incrementar(ceramica)">+</button>
            </div>
          </div>
          <p *ngIf="ceramicas.length === 0" class="mensaje-vacio">
            {{ cargando ? 'Cargando cerámicas...' : 'No hay cerámicas disponibles' }}
          </p>
        </div>

        <!-- Resumen de selección -->
        <div class="resumen" *ngIf="obtenerTotal() > 0">
          <h3>Resumen de selección</h3>
          <div *ngFor="let item of obtenerSeleccionados()" class="item-resumen">
            <span>{{ item.name }} x{{ item.cantidad }}</span>
            <span>{{ item.price * item.cantidad! | currency:'USD':'symbol':'1.0-0' }}</span>
          </div>
          <div class="total">
            <strong>Total:</strong>
            <strong>{{ obtenerTotal() | currency:'USD':'symbol':'1.0-0' }}</strong>
          </div>
        </div>
      </div>

      <div class="acciones">
        <button class="btn-cancelar" (click)="cerrar()">Cancelar</button>
        <button 
          class="btn-agregar" 
          (click)="agregarProductos()"
          [disabled]="obtenerTotal() === 0"
        >
          Agregar ({{ obtenerSeleccionados().length }})
        </button>
      </div>
    </div>
  `,
  styles: [`
    .modal-productos {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
      border-radius: 8px;
      max-height: 90vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 2px solid #eee;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px 8px 0 0;
    }

    .header h2 {
      margin: 0;
      font-size: 24px;
    }

    .close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: rotate(90deg);
    }

    .contenido {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    /* Lista de productos (Cafetería) */
    .lista-productos {
      display: grid;
      gap: 15px;
    }

    .producto-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 12px;
      transition: all 0.3s;
      border: 2px solid transparent;
    }

    .producto-item:hover {
      background: #f0f0f0;
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }

    .info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .nombre {
      font-weight: 600;
      color: #333;
      font-size: 16px;
    }

    .precio {
      color: #667eea;
      font-size: 18px;
      font-weight: 700;
    }

    .descripcion {
      color: #666;
      font-size: 13px;
    }

    /* Grid de cerámicas */
    .grid-ceramicas {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .ceramica-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s;
      border: 2px solid transparent;
    }

    .ceramica-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
      border-color: #667eea;
    }

    .ceramica-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      background: #f0f0f0;
    }

    .ceramica-info {
      padding: 15px;
    }

    .ceramica-info h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 16px;
    }

    /* Controles */
    .controles {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      background: #f5f5f5;
    }

    .controles button {
      width: 36px;
      height: 36px;
      border: none;
      background: #667eea;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 20px;
      font-weight: bold;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .controles button:hover:not(:disabled) {
      background: #764ba2;
      transform: scale(1.1);
    }

    .controles button:disabled {
      background: #ccc;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .controles input {
      width: 60px;
      text-align: center;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 8px;
      font-size: 16px;
      font-weight: 600;
    }

    .controles input:focus {
      outline: none;
      border-color: #667eea;
    }

    /* Resumen */
    .resumen {
      margin-top: 25px;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }

    .resumen h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 18px;
    }

    .item-resumen {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      font-size: 14px;
    }

    .total {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 3px solid #667eea;
      font-size: 20px;
      color: #667eea;
    }

    .mensaje-vacio {
      text-align: center;
      color: #999;
      padding: 40px;
      font-size: 16px;
    }

    /* Acciones */
    .acciones {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      padding: 20px;
      border-top: 2px solid #eee;
      background: #f9f9f9;
    }

    .acciones button {
      padding: 12px 30px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-cancelar {
      background: #f0f0f0;
      color: #333;
    }

    .btn-cancelar:hover {
      background: #e0e0e0;
    }

    .btn-agregar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-agregar:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-agregar:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }
  `]
})
export class ModalSeleccionProductosComponent implements OnInit {
  productos: Producto[] = [];
  ceramicas: Ceramica[] = [];
  cargando = false;

  // URLs de tu backend (puerto 4000)
  private URL_PRODUCTOS = 'https://backgaleriacafe.onrender.com/api/products';
  private URL_CERAMICAS = 'https://backgaleriacafe.onrender.com/api/ceramics';

  constructor(
    public dialogRef: MatDialogRef<ModalSeleccionProductosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tipo: string; mesa: number },
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;

    if (this.data.tipo === 'Cafetería') {
      // Cargar productos desde el backend
      this.http.get<Producto[]>(this.URL_PRODUCTOS)
        .pipe(
          catchError(err => {
            console.warn('⚠️ No se pudieron cargar los productos:', err);
            return of([]);
          })
        )
        .subscribe(data => {
          // Solo productos activos con cantidad inicial en 0
          this.productos = data
            .filter(p => p.active)
            .map(p => ({ ...p, cantidad: 0 }));
          this.cargando = false;
          console.log('✅ Productos cargados:', this.productos);
        });
    } else if (this.data.tipo === 'Cerámicas') {
      // Cargar cerámicas desde el backend
      this.http.get<Ceramica[]>(this.URL_CERAMICAS)
        .pipe(
          catchError(err => {
            console.warn('⚠️ No se pudieron cargar las cerámicas:', err);
            return of([]);
          })
        )
        .subscribe(data => {
          // Solo cerámicas activas con cantidad inicial en 0
          this.ceramicas = data
            .filter(c => c.active)
            .map(c => ({ ...c, cantidad: 0 }));
          this.cargando = false;
          console.log('✅ Cerámicas cargadas:', this.ceramicas);
        });
    }
  }

  incrementar(item: Producto | Ceramica) {
    item.cantidad = (item.cantidad || 0) + 1;
  }

  decrementar(item: Producto | Ceramica) {
    if (item.cantidad && item.cantidad > 0) {
      item.cantidad--;
    }
  }

  validarCantidad(item: Producto | Ceramica) {
    if (!item.cantidad || item.cantidad < 0) {
      item.cantidad = 0;
    }
    // Asegurar que sea un número entero
    item.cantidad = Math.floor(item.cantidad);
  }

  obtenerSeleccionados(): (Producto | Ceramica)[] {
    const lista = this.data.tipo === 'Cafetería' ? this.productos : this.ceramicas;
    return lista.filter(item => item.cantidad && item.cantidad > 0);
  }

  obtenerTotal(): number {
    const lista = this.data.tipo === 'Cafetería' ? this.productos : this.ceramicas;
    return lista.reduce((sum, item) => sum + (item.price * (item.cantidad || 0)), 0);
  }

  agregarProductos() {
    const seleccionados = this.obtenerSeleccionados();
    
    if (seleccionados.length > 0) {
      console.log('📦 Productos seleccionados para Mesa', this.data.mesa, ':', seleccionados);
      this.dialogRef.close({ productosSeleccionados: seleccionados });
    }
  }

  cerrar() {
    this.dialogRef.close();
  }
}