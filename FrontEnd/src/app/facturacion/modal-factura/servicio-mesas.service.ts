import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ProductoFactura {
  _id?: string;
  name: string;
  price: number;
  cantidad: number;
  tipo: 'Cerámicas' | 'Cafetería';
  description?: string;
}

export interface MesaEstado {
  numeroMesa: number;
  productos: ProductoFactura[];
  total: number;
  ultimaActualizacion: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MesasService {
  // Almacenamos el estado de todas las mesas
  private mesasEstado = new Map<number, MesaEstado>();
  
  // Subject para notificar cambios (opcional, para reactividad)
  private mesasSubject = new BehaviorSubject<Map<number, MesaEstado>>(this.mesasEstado);
  public mesas$ = this.mesasSubject.asObservable();

  constructor() {
    // Intentar recuperar del localStorage al iniciar
    this.cargarDesdeLocalStorage();
  }

  /**
   * Obtiene los productos de una mesa específica
   */
  obtenerProductosMesa(numeroMesa: number): ProductoFactura[] {
    const mesa = this.mesasEstado.get(numeroMesa);
    return mesa ? [...mesa.productos] : [];
  }

  /**
   * Guarda o actualiza los productos de una mesa
   */
  guardarProductosMesa(numeroMesa: number, productos: ProductoFactura[]): void {
    const total = productos.reduce((sum, p) => sum + (p.price * p.cantidad), 0);
    
    this.mesasEstado.set(numeroMesa, {
      numeroMesa,
      productos: [...productos],
      total,
      ultimaActualizacion: new Date()
    });

    // Guardar en localStorage para persistencia
    this.guardarEnLocalStorage();
    
    // Notificar cambios
    this.mesasSubject.next(this.mesasEstado);
    
    console.log(`💾 Mesa ${numeroMesa} guardada:`, productos);
  }

  /**
   * Agrega un producto a una mesa existente
   */
  agregarProducto(numeroMesa: number, producto: ProductoFactura): void {
    const productosActuales = this.obtenerProductosMesa(numeroMesa);
    
    const existente = productosActuales.find(p => p._id === producto._id);
    
    if (existente) {
      existente.cantidad += producto.cantidad;
    } else {
      productosActuales.push(producto);
    }
    
    this.guardarProductosMesa(numeroMesa, productosActuales);
  }

  /**
   * Limpia los productos de una mesa (después del pago)
   */
  limpiarMesa(numeroMesa: number): void {
    this.mesasEstado.delete(numeroMesa);
    this.guardarEnLocalStorage();
    this.mesasSubject.next(this.mesasEstado);
    console.log(`🧹 Mesa ${numeroMesa} limpiada`);
  }

  /**
   * Obtiene el total de una mesa
   */
  obtenerTotalMesa(numeroMesa: number): number {
    const mesa = this.mesasEstado.get(numeroMesa);
    return mesa ? mesa.total : 0;
  }

  /**
   * Verifica si una mesa tiene productos
   */
  mesaTieneProductos(numeroMesa: number): boolean {
    const productos = this.obtenerProductosMesa(numeroMesa);
    return productos.length > 0;
  }

  /**
   * Obtiene todas las mesas con productos
   */
  obtenerMesasActivas(): MesaEstado[] {
    return Array.from(this.mesasEstado.values());
  }

  // ========== PERSISTENCIA EN LOCALSTORAGE ==========

  private guardarEnLocalStorage(): void {
    try {
      const datos = Array.from(this.mesasEstado.entries());
      localStorage.setItem('mesas_estado', JSON.stringify(datos));
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  private cargarDesdeLocalStorage(): void {
    try {
      const datos = localStorage.getItem('mesas_estado');
      if (datos) {
        const entries = JSON.parse(datos);
        this.mesasEstado = new Map(entries);
        this.mesasSubject.next(this.mesasEstado);
        console.log('📂 Datos de mesas recuperados del localStorage');
      }
    } catch (error) {
      console.error('Error al cargar desde localStorage:', error);
    }
  }

  /**
   * Limpia todos los datos (útil para testing o reset)
   */
  limpiarTodo(): void {
    this.mesasEstado.clear();
    localStorage.removeItem('mesas_estado');
    this.mesasSubject.next(this.mesasEstado);
    console.log('🗑️ Todos los datos limpiados');
  }
}