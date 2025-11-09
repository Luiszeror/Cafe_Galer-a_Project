import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-modal-factura',
  templateUrl: './modal-factura.html',
  styleUrls: ['./modal-factura.css']
})
export class ModalFacturaComponent {
  mostrarSeleccion = false;
  constructor(
    public dialogRef: MatDialogRef<ModalFacturaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mesa: number }
  ) {}

  cerrar() {
    this.dialogRef.close();
  }

  cancelar() {
    console.log('Operación cancelada');
    this.dialogRef.close();
  }

  anadirProducto() {
    this.mostrarSeleccion = true; // muestra el submodal
  }

  seleccionarProducto(tipo: string) {
    console.log('Seleccionaste:', tipo);
    this.mostrarSeleccion = false; // cierra el submodal
  }

  cerrarSeleccion() {
    this.mostrarSeleccion = false;
  }

  pagar() {
    console.log('Procesar pago...');
  }
}

