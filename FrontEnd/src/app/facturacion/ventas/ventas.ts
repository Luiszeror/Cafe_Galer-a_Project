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
  dayFinished?: boolean; // 👈 NUEVO
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
  private apiUrl = 'https://backgaleriacafe.onrender.com/api/sales';
  
  // Actividad reciente del día
  ventasHoy: Sale[] = [];
  totalDia: number = 0;
  diaTerminado: boolean = false; // 👈 NUEVO
  
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
    this.verificarDiaTerminado(); // 👈 NUEVO
    this.cargarVentasHoy();
    this.cargarCalendario();
  }

  // ========== VERIFICAR SI EL DÍA YA TERMINÓ ==========
  verificarDiaTerminado() {
    const fechaTerminado = localStorage.getItem('diaTerminado');
    const hoy = new Date().toDateString();
    
    if (fechaTerminado === hoy) {
      this.diaTerminado = true;
      this.ventasHoy = [];
      this.totalDia = 0;
    } else if (fechaTerminado && fechaTerminado !== hoy) {
      // Si es un nuevo día, limpiamos el flag
      localStorage.removeItem('diaTerminado');
      this.diaTerminado = false;
    }
  }

  // ========== ACTIVIDAD RECIENTE ==========
  cargarVentasHoy() {
    // Si el día ya terminó, no cargamos ventas
    if (this.diaTerminado) {
      this.ventasHoy = [];
      this.totalDia = 0;
      return;
    }

    const hoy = new Date();
    const inicio = new Date(hoy.setHours(0, 0, 0, 0)).toISOString();
    hoy.setHours(23, 59, 59, 999);
    const fin = new Date(hoy).toISOString();
    
    this.http.get<Sale[]>(`${this.apiUrl}?start=${inicio}&end=${fin}`)
      .subscribe({
        next: (ventas) => {
          // Solo mostramos las del día actual si no ha terminado
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
    if (this.diaTerminado) {
      alert('El día ya ha sido cerrado. No se pueden agregar más gastos.');
      return;
    }
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

    const gasto = {
      products: [],
      ceramics: [],
      totalAmount: -Math.abs(this.nuevoGasto.monto),
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
    if (this.diaTerminado) {
      alert('El día ya ha sido terminado.');
      return;
    }

    const gastosPendientes = this.ventasHoy.filter(v => this.esGasto(v) && !v._id);
    
    if (gastosPendientes.length > 0) {
      alert(`Hay ${gastosPendientes.length} gastos sin guardar. Por favor guárdalos primero.`);
      return;
    }

    if (!confirm(`¿Terminar el día con un total de $${this.totalDia.toFixed(2)}?`)) {
      return;
    }
    
    // 👇 GUARDAR EN LOCALSTORAGE QUE EL DÍA TERMINÓ
    const hoy = new Date().toDateString();
    localStorage.setItem('diaTerminado', hoy);
    
    this.diaTerminado = true;
    this.ventasHoy = [];
    this.totalDia = 0;
    
    alert('¡Día terminado! Todas las ventas y gastos están en el historial.');
    this.cargarCalendario();
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

  procesarVentasCalendario(ventas: Sale[], dias: DaySummary[]) {
    dias.forEach(d => d.total = 0);
    
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

  // ========== FORMATO DE FECHAS MEJORADO ==========
  
  // 👇 Para el título de la vista
  tituloVista(): string {
    if (this.vistaCalendario === 'semana') {
      return this.tituloSemana();
    } else {
      return this.tituloMes();
    }
  }

  // 👇 "Semana del 18 al 24 de Noviembre 2025"
  tituloSemana(): string {
    if (this.diasSemana.length === 0) return '';
    
    const primerDia = this.diasSemana[0].date;
    const ultimoDia = this.diasSemana[6].date;
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const mes = meses[primerDia.getMonth()];
    const año = primerDia.getFullYear();
    
    return `Semana del ${primerDia.getDate()} al ${ultimoDia.getDate()} de ${mes} ${año}`;
  }

  // 👇 "Noviembre 2025"
  tituloMes(): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mes = meses[this.fechaSeleccionada.getMonth()];
    const año = this.fechaSeleccionada.getFullYear();
    return `${mes} ${año}`;
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