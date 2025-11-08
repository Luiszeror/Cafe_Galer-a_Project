import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './componentes/home/home.component'; 
import { Dashboard } from './componentes/dashboard/dashboard';
import { AuthGuard } from './auth/auth.guard'; // 👈 importa aquí
import { ConfiguracionComponent } from './componentes/configuracion/configuracion';
import { Mesas3DComponent } from './facturacion/mesas/mesas';
import { ProductosComponent } from './componentes/productos/productos';
import { CeramicasComponent } from './componentes/ceramicas/ceramicas';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent }, // 🚫 sin guard
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, 
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AuthGuard] },
  { path: 'mesas', component: Mesas3DComponent, canActivate: [AuthGuard]},
  { path: 'productos', component: ProductosComponent, canActivate: [AuthGuard]},
  {path: 'ceramicas', component: CeramicasComponent, canActivate: [AuthGuard]}



];
