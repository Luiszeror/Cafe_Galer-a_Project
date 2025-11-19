import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  private apiUrl = 'https://backgaleriacafe.onrender.com/api/sales'; // <-- Backend Node/Mongo

  ventas: any[] = [];
  totalVentas = 0;
  totalProductos = 0;
  totalCeramicas = 0;
  dineroTotal = 0; // 💰 Nuevo campo
  clienteMasFrecuente = '';
  actividadReciente = 'Cargando...';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarVentas();
  }

  // 🔁 Cargar las ventas desde el backend
  cargarVentas() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.ventas = data || [];
        this.totalVentas = this.ventas.length;

        // 💰 Total de dinero vendido (sumando totalAmount)
        this.dineroTotal = this.ventas.reduce((acc, v) => acc + (v.totalAmount || 0), 0);

        // 🧮 Total de productos vendidos
        this.totalProductos = this.ventas.reduce((acc, v) => {
          const prod = v.products?.reduce((a: number, p: any) => a + (p.quantity || 0), 0) || 0;
          return acc + prod;
        }, 0);

        // 🧱 Total de cerámicas vendidas
        this.totalCeramicas = this.ventas.reduce((acc, v) => {
          const cer = v.ceramics?.reduce((a: number, c: any) => a + (c.quantity || 0), 0) || 0;
          return acc + cer;
        }, 0);

        // 👤 Cliente más frecuente
        const clientes: Record<string, number> = {};
        this.ventas.forEach(v => {
          if (v.customer) clientes[v.customer] = (clientes[v.customer] || 0) + 1;
        });
        this.clienteMasFrecuente = Object.keys(clientes).length > 0
          ? Object.entries(clientes).sort((a, b) => b[1] - a[1])[0][0]
          : 'Ninguno';

        // 🕓 Última venta
        if (this.ventas.length > 0) {
          const ultima = this.ventas[this.ventas.length - 1];
          this.actividadReciente = `Última venta a ${ultima.customer} por $${ultima.totalAmount.toFixed(2)} USD`;
        } else {
          this.actividadReciente = 'Sin ventas registradas';
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar ventas:', err);
        this.actividadReciente = 'Error al conectar con el servidor';
      }
    });
  }
}
