import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './componentes/home/home.component'; 
import { Dashboard } from './componentes/dashboard/dashboard';
import { AuthGuard } from './auth/auth.guard'; // 👈 importa aquí
import { ConfiguracionComponent } from './componentes/configuracion/configuracion';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent }, // 🚫 sin guard
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, 
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AuthGuard] }

];
