import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './componentes/home/home.component'; 

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent }, 
  { path: 'login', component: LoginComponent } 
];
