import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { MesasComponent } from './facturacion/mesas/mesas';
import { AuthGuard } from './auth/auth.guard'; // 👈 IMPORTANTE: agrega el guard
import { Ventas } from './facturacion/ventas/ventas';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 🚫 Login sin protección
  { path: 'login', component: LoginComponent },

  // ✅ Rutas protegidas por AuthGuard
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'mesas', component: MesasComponent, canActivate: [AuthGuard] },
    { path: 'ventas', component: Ventas, canActivate: [AuthGuard] },


  // 🔁 Cualquier ruta no reconocida redirige al login
  { path: '**', redirectTo: 'login' }
];
