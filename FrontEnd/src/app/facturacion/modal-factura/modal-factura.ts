import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ModalSeleccionProductosComponent } from './modal-seleccion-productos.component';
import { MesasService, ProductoFactura } from './servicio-mesas.service';

@Component({
  selector: 'app-modal-factura',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './modal-factura.html',
  styleUrls: ['./modal-factura.css']
})
export class ModalFacturaComponent {
  mostrarSeleccion = false;
  productosFactura: ProductoFactura[] = [];

  constructor(
    public dialogRef: MatDialogRef<ModalFacturaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mesa: number },
    private dialog: MatDialog,
    private http: HttpClient,
    private mesasService: MesasService  // ⭐ Inyectar el servicio
  ) {
    // Cargar productos existentes de la mesa desde el servicio
    this.cargarProductosMesa();
  }

  cargarProductosMesa() {
    // ⭐ Recuperar productos del servicio en lugar de iniciar vacío
    this.productosFactura = this.mesasService.obtenerProductosMesa(this.data.mesa);
    
    console.log(`📋 Productos cargados para Mesa ${this.data.mesa}:`, this.productosFactura);
    
    // Si necesitas sincronizar con el backend también:
    // this.http.get<ProductoFactura[]>(`http://localhost:4000/api/mesas/${this.data.mesa}/productos`)
    //   .subscribe(productos => {
    //     this.productosFactura = productos;
    //     this.mesasService.guardarProductosMesa(this.data.mesa, productos);
    //   });
  }

  cerrar() {
    // ⭐ Guardar estado antes de cerrar
    this.guardarEstadoMesa();
    this.dialogRef.close();
  }

  cancelar() {
    console.log('Operación cancelada para Mesa', this.data.mesa);
    // ⭐ Guardar estado antes de cancelar
    this.guardarEstadoMesa();
    this.dialogRef.close();
  }

  // ⭐ Nuevo método para guardar el estado
  private guardarEstadoMesa() {
    this.mesasService.guardarProductosMesa(this.data.mesa, this.productosFactura);
  }

  anadirProducto() {
    this.mostrarSeleccion = true;
  }

  seleccionarProducto(tipo: 'Cerámicas' | 'Cafetería') {
    console.log('Tipo seleccionado:', tipo, 'para Mesa', this.data.mesa);
    this.mostrarSeleccion = false;
    this.abrirModalProductos(tipo);
  }

  abrirModalProductos(tipo: 'Cerámicas' | 'Cafetería') {
    const dialogRef = this.dialog.open(ModalSeleccionProductosComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: { 
        tipo: tipo,
        mesa: this.data.mesa
      },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado && resultado.productosSeleccionados) {
        // Agregar los productos seleccionados a la factura
        resultado.productosSeleccionados.forEach((prod: any) => {
          const existente = this.productosFactura.find(p => p._id === prod._id);
          
          if (existente) {
            existente.cantidad += prod.cantidad;
            console.log(`➕ Sumado a ${existente.name}: nueva cantidad = ${existente.cantidad}`);
          } else {
            this.productosFactura.push({
              _id: prod._id,
              name: prod.name,
              price: prod.price,
              cantidad: prod.cantidad,
              tipo: tipo,
              description: prod.description
            });
            console.log(`✅ Agregado: ${prod.name} x${prod.cantidad}`);
          }
        });
        
        // ⭐ Guardar automáticamente después de agregar productos
        this.guardarEstadoMesa();
        
        console.log('📋 Factura actualizada Mesa', this.data.mesa, ':', this.productosFactura);
      }
    });
  }

  cerrarSeleccion() {
    this.mostrarSeleccion = false;
  }

  eliminarProducto(producto: ProductoFactura) {
    const index = this.productosFactura.indexOf(producto);
    if (index > -1) {
      this.productosFactura.splice(index, 1);
      console.log(`🗑️ Eliminado: ${producto.name}`);
      
      // ⭐ Guardar después de eliminar
      this.guardarEstadoMesa();
    }
  }

  modificarCantidad(producto: ProductoFactura, nuevaCantidad: number) {
    if (nuevaCantidad <= 0) {
      this.eliminarProducto(producto);
    } else {
      producto.cantidad = nuevaCantidad;
      
      // ⭐ Guardar después de modificar
      this.guardarEstadoMesa();
    }
  }

  calcularSubtotal(producto: ProductoFactura): number {
    return producto.price * producto.cantidad;
  }

  calcularTotal(): number {
    return this.productosFactura.reduce((sum, p) => sum + (p.price * p.cantidad), 0);
  }

  pagar() {
    if (this.productosFactura.length === 0) {
      alert('No hay productos en la factura');
      return;
    }

    console.log('💰 Procesando pago para Mesa', this.data.mesa);
    console.log('Total a pagar:', this.calcularTotal());
    console.log('Productos:', this.productosFactura);
    
    // Separar productos de cafetería y cerámicas
    const productosCafeteria = this.productosFactura.filter(p => p.tipo === 'Cafetería');
    const ceramicasVendidas = this.productosFactura.filter(p => p.tipo === 'Cerámicas');
    
    // Preparar datos según el formato del backend
    const saleData = {
      products: productosCafeteria.map(p => ({
        productId: p._id,
        name: p.name,
        quantity: p.cantidad,
        price: p.price
      })),
      ceramics: ceramicasVendidas.map(c => ({
        ceramicId: c._id,
        name: c.name,
        quantity: c.cantidad,
        price: c.price
      })),
      customer: `Mesa ${this.data.mesa}`,
      date: new Date()
    };

    console.log('📤 Enviando venta al backend:', saleData);

    // POST al backend para crear la venta
    this.http.post('http://localhost:4000/api/sales', saleData)
      .subscribe({
        next: (response) => {
          console.log('✅ Venta registrada:', response);
          
          // Eliminar las cerámicas vendidas de la base de datos
          if (ceramicasVendidas.length > 0) {
            this.eliminarCeramicasVendidas(ceramicasVendidas).then(() => {
              console.log('🗑️ Cerámicas eliminadas exitosamente');
              this.finalizarPago(response);
            }).catch(error => {
              console.error('⚠️ Error al eliminar cerámicas, pero venta registrada:', error);
              // Continuar con el flujo aunque falle la eliminación
              this.finalizarPago(response);
            });
          } else {
            this.finalizarPago(response);
          }
        },
        error: (error) => {
          console.error('❌ Error al registrar la venta:', error);
          alert('Error al procesar el pago. Por favor, intenta nuevamente.');
        }
      });
  }

  // Método auxiliar para eliminar cerámicas vendidas
  private async eliminarCeramicasVendidas(ceramicas: ProductoFactura[]): Promise<void> {
    const promesas = ceramicas.map(ceramica => {
      return this.http.delete(`http://localhost:4000/api/ceramics/${ceramica._id}`)
        .toPromise()
        .catch(err => {
          console.error(`Error al eliminar cerámica ${ceramica.name}:`, err);
          return null; // No bloqueamos el flujo por una cerámica
        });
    });

    await Promise.all(promesas);
  }

  // Método auxiliar para finalizar el pago
  private finalizarPago(ventaResponse: any): void {
    alert(`✅ Pago procesado exitosamente!\n\nTotal: ${this.calcularTotal().toLocaleString()}\nMesa: ${this.data.mesa}`);
    
    // Limpiar la mesa después del pago exitoso
    this.mesasService.limpiarMesa(this.data.mesa);
    
    this.dialogRef.close({ 
      pagado: true, 
      venta: ventaResponse,
      total: this.calcularTotal() 
    });
  }
}