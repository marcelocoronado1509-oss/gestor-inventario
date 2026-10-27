
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
      this.mensaje = 'Introduce tu correo y contraseña.';
      return;
    }

    this.cargando = true;

    try {
      console.log('1. Comprobando credenciales...');

      const accesoCorrecto = this.authService.login(
        this.email.trim(),
        this.password
      );

      if (!accesoCorrecto) {
        this.mensaje = 'Correo o contraseña incorrectos.';
        return;
      }

      console.log('2. Credenciales correctas.');

      const usuario = this.authService.obtenerUsuarioActual();

      if (!usuario) {
        this.mensaje = 'No se ha podido recuperar el usuario.';
        return;
      }

      const destino =
        usuario.rol === 'admin' ? '/dashboard' : '/productos';

      console.log('3. Navegando a:', destino);

      const navegacionCorrecta =
        await this.router.navigateByUrl(destino);

      if (!navegacionCorrecta) {
        this.mensaje =
          'El acceso se ha validado, pero no se ha podido abrir la página. Revisa las rutas y los permisos.';
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      this.mensaje =
        'No se ha podido iniciar sesión. Revisa la consola para ver el error.';
    } finally {
      this.cargando = false;
      console.log('4. Finalizado el intento de inicio de sesión.');
    }
  }
}
