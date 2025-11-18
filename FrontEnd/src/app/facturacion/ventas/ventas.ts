import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Sale {
  _id: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  ceramics: Array<{
    ceramicId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  customer: string;
  date: Date;
  isExpense?: boolean;
}

interface DaySummary {
  date: Date;
  total: number;
  ventas: Sale[];
  gastos: Sale[];
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.css']
})
export class Ventas implements OnInit {
  private apiUrl = 'http://localhost:4000/api/sales';
  
  // Actividad reciente del día
  ventasHoy: Sale[] = [];
  totalDia: number = 0;
  
  // Modal para agregar gasto
  mostrarModalGasto: boolean = false;
  nuevoGasto = { descripcion: '', monto: 0 };
  
  // Calendario
  vistaCalendario: 'semana' | 'mes' = 'semana';
  fechaSeleccionada: Date = new Date();
  diasSemana: DaySummary[] = [];
  diasMes: DaySummary[] = [];
  diaDetalleSeleccionado: DaySummary | null = null;
  
  // Totales del período
  totalSemana: number = 0;
  totalMes: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarVentasHoy();
    this.cargarCalendario();
  }

  // ========== ACTIVIDAD RECIENTE ==========
  cargarVentasHoy() {
    const hoy = new Date();
    const inicio = new Date(hoy.setHours(0, 0, 0, 0)).toISOString();
    hoy.setHours(23, 59, 59, 999);
    const fin = new Date(hoy).toISOString();
    
    this.http.get<Sale[]>(`${this.apiUrl}?start=${inicio}&end=${fin}`)
      .subscribe({
        next: (ventas) => {
          this.ventasHoy = ventas.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          this.calcularTotalDia();
        },
        error: (err) => console.error('Error cargando ventas:', err)
      });
  }

  calcularTotalDia() {
  this.totalDia = Math.round(
    this.ventasHoy.reduce((sum, v) => sum + v.totalAmount, 0)
  );
}
  construirDescripcion(venta: Sale): string {
    if (venta.isExpense || venta.totalAmount < 0) {
      return venta.customer || 'Gasto';
    }
    
    const items = [];
    if (venta.products?.length) {
      items.push(...venta.products.map(p => `${p.quantity}x ${p.name}`));
    }
    if (venta.ceramics?.length) {
      items.push(...venta.ceramics.map(c => `${c.quantity}x ${c.name}`));
    }
    return items.join(', ') || 'Venta sin items';
  }

  esGasto(venta: Sale): boolean {
    return venta.isExpense || venta.totalAmount < 0;
  }

  // ========== GASTOS ==========
  abrirModalGasto() {
    this.mostrarModalGasto = true;
    this.nuevoGasto = { descripcion: '', monto: 0 };
  }

  cerrarModalGasto() {
    this.mostrarModalGasto = false;
  }

  guardarGasto() {
    if (!this.nuevoGasto.descripcion || this.nuevoGasto.monto <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    // ⭐ Crear gasto con el formato correcto para el backend
    const gasto = {
      products: [],
      ceramics: [],
      totalAmount: -Math.abs(this.nuevoGasto.monto), // Negativo
      customer: this.nuevoGasto.descripcion,
      date: new Date().toISOString(),
      isExpense: true
    };

    this.http.post<Sale>(this.apiUrl, gasto)
      .subscribe({
        next: (gastoCreado) => {
          console.log('✅ Gasto guardado:', gastoCreado);
          this.ventasHoy.unshift(gastoCreado);
          this.calcularTotalDia();
          this.cerrarModalGasto();
          this.cargarCalendario();
        },
        error: (err) => {
          console.error('❌ Error guardando gasto:', err);
          alert(`Error al guardar el gasto: ${err.error?.message || err.message}`);
        }
      });
  }

  // ========== TERMINAR DÍA ==========
  terminarDia() {
    const gastosPendientes = this.ventasHoy.filter(v => this.esGasto(v) && !v._id);
    
    if (gastosPendientes.length > 0) {
      alert(`Hay ${gastosPendientes.length} gastos sin guardar. Por favor guárdalos primero.`);
      return;
    }

    if (!confirm(`¿Terminar el día con un total de $${this.totalDia.toFixed(2)}?`)) {
      return;
    }
    
    // Las ventas y gastos ya están guardados en la BD
    this.ventasHoy = [];
    this.totalDia = 0;
    
    alert('¡Día terminado! Todas las ventas y gastos están en el historial.');
    this.cargarCalendario(); // Refrescar el calendario
  }

  // ========== CALENDARIO ==========
  cargarCalendario() {
    if (this.vistaCalendario === 'semana') {
      this.cargarSemana();
    } else {
      this.cargarMes();
    }
  }

  cargarSemana() {
    const hoy = new Date(this.fechaSeleccionada);
    const diaSemana = hoy.getDay();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1));

    this.diasSemana = [];
    
    for (let i = 0; i < 7; i++) {
      const dia = new Date(lunes);
      dia.setDate(lunes.getDate() + i);
      this.diasSemana.push({
        date: dia,
        total: 0,
        ventas: [],
        gastos: []
      });
    }

    const inicio = new Date(lunes);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(lunes);
    fin.setDate(lunes.getDate() + 6);
    fin.setHours(23, 59, 59, 999);

    this.http.get<Sale[]>(`${this.apiUrl}?start=${inicio.toISOString()}&end=${fin.toISOString()}`)
      .subscribe({
        next: (ventas) => this.procesarVentasCalendario(ventas, this.diasSemana),
        error: (err) => console.error('Error cargando semana:', err)
      });
  }

  cargarMes() {
    const fecha = new Date(this.fechaSeleccionada);
    const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

    this.diasMes = [];
    
    for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
      this.diasMes.push({
        date: new Date(d),
        total: 0,
        ventas: [],
        gastos: []
      });
    }

    primerDia.setHours(0, 0, 0, 0);
    ultimoDia.setHours(23, 59, 59, 999);

    this.http.get<Sale[]>(`${this.apiUrl}?start=${primerDia.toISOString()}&end=${ultimoDia.toISOString()}`)
      .subscribe({
        next: (ventas) => this.procesarVentasCalendario(ventas, this.diasMes),
        error: (err) => console.error('Error cargando mes:', err)
      });
  }

  // En tu componente, reemplaza procesarVentasCalendario con:
procesarVentasCalendario(ventas: Sale[], dias: DaySummary[]) {
  // Primero limpia los totales
  dias.forEach(d => d.total = 0);
  
  // Luego procesa las ventas
  ventas.forEach(venta => {
    const fechaVenta = new Date(venta.date);
    const dia = dias.find(d => 
      d.date.toDateString() === fechaVenta.toDateString()
    );

    if (dia) {
      if (this.esGasto(venta)) {
        dia.gastos.push(venta);
      } else {
        dia.ventas.push(venta);
      }
      dia.total += venta.totalAmount;
    }
  });

  // Calcula los totales del período
  this.calcularTotalesPeriodo(dias);
}

calcularTotalesPeriodo(dias: DaySummary[]) {
  this.totalSemana = Math.round(dias.reduce((sum, d) => sum + d.total, 0));
  this.totalMes = Math.round(dias.reduce((sum, d) => sum + d.total, 0));
}

  cambiarVista(vista: 'semana' | 'mes') {
    this.vistaCalendario = vista;
    this.cargarCalendario();
  }

  navegarPeriodo(direccion: 'anterior' | 'siguiente') {
    const fecha = new Date(this.fechaSeleccionada);
    
    if (this.vistaCalendario === 'semana') {
      fecha.setDate(fecha.getDate() + (direccion === 'siguiente' ? 7 : -7));
    } else {
      fecha.setMonth(fecha.getMonth() + (direccion === 'siguiente' ? 1 : -1));
    }
    
    this.fechaSeleccionada = fecha;
    this.cargarCalendario();
  }

  verDetalleDia(dia: DaySummary) {
    this.diaDetalleSeleccionado = dia;
  }

  cerrarDetalle() {
    this.diaDetalleSeleccionado = null;
  }

  nombreMes(): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[this.fechaSeleccionada.getMonth()];
  }

  formatearFecha(fecha: Date): string {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${dias[fecha.getDay()]} ${fecha.getDate()}`;
  }

  formatearHora(fecha: Date): string {
    return new Date(fecha).toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    const fechaComparar = new Date(fecha);
    return fechaComparar.toDateString() === hoy.toDateString();
  }
}