
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonButton,
  IonContent,
  IonInput,
  IonSpinner,
  IonIcon
} from '@ionic/angular';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonInput,
    IonSpinner,
    IonIcon
  ]
})
export class LoginPage {
  email = '';
  password = '';
  mensaje = '';
  cargando = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  usarUsuarioPrueba(tipo: 'admin' | 'user'): void {
    this.mensaje = '';

    if (tipo === 'admin') {
      this.email = 'admin@inventario.com';
      this.password = 'Admin123!';
    } else {
      this.email = 'usuario@inventario.com';
      this.password = 'Usuario123!';
    }
  }

  async iniciarSesion(): Promise<void> {
    if (this.cargando) {
      return;
    }

    this.mensaje = '';

    if (!this.email.trim() || !this.password) {
      this.mensaje =
        'Introduce tu correo electrónico y contraseña.';
      return;
    }

    this.cargando = true;

    try {
      const resultado = await this.authService.login(
        this.email,
        this.password
      );

      if (!resultado.ok) {
        this.mensaje =
          resultado.error ?? 'No se ha podido iniciar sesión.';
        return;
      }

      const usuario = this.authService.obtenerUsuarioActual();

      const destino =
        usuario?.rol === 'admin' ? '/dashboard' : '/productos';

      const navegacionCorrecta =
        await this.router.navigateByUrl(destino);

      if (!navegacionCorrecta) {
        this.mensaje =
          'La sesión se ha iniciado, pero no se ha podido abrir la página. Revisa las rutas.';
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.mensaje =
        'Ha ocurrido un error al iniciar sesión.';
    } finally {
      this.cargando = false;
    }
  }
}
