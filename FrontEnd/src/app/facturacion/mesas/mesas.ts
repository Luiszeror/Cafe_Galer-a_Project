import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalFacturaComponent } from '../modal-factura/modal-factura';

@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.html',
  styleUrls: ['./mesas.css']
})
export class MesasComponent {
  constructor(private dialog: MatDialog) {}

  abrirModal(numeroMesa: number) {
    this.dialog.open(ModalFacturaComponent, {
      data: { mesa: numeroMesa },
      width: '80vw',   // 80% del ancho de la pantalla
    height: '50vh',  // 80% de la altura de la pantalla
    maxWidth: '650px', // límite máximo
    panelClass: 'factura-dialog' // clase CSS personalizada
    });
  }
}
