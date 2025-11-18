import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './componentes/home/home.component'; 
import { Dashboard } from './componentes/dashboard/dashboard';
import { AuthGuard } from './auth/auth.guard';
import { ConfiguracionComponent } from './componentes/configuracion/configuracion';
import { MesasComponent } from './facturacion/mesas/mesas';
import { ProductosComponent } from './componentes/productos/productos';
import { CeramicasComponent } from './componentes/ceramicas/ceramicas';
import { Facturacion } from './componentes/facturacion/facturacion'; 
import { Ventas } from './facturacion/ventas/ventas';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 🚫 Login sin protección
  { path: 'login', component: LoginComponent },

  // ✅ Rutas protegidas
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AuthGuard] },
  { path: 'mesas', component: MesasComponent, canActivate: [AuthGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [AuthGuard] },
  { path: 'ceramicas', component: CeramicasComponent, canActivate: [AuthGuard] },
  { path: 'facturacion', component: Facturacion, canActivate: [AuthGuard] },
  { path: 'ventas', component: Ventas, canActivate: [AuthGuard] },

  // 🚨 EL WILDCARD SIEMPRE VA DE ÚLTIMO
  { path: '**', redirectTo: 'home' }
];

