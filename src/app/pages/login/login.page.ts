import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonText,
  IonButton
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  
imports: [ CommonModule, FormsModule,IonHeader,IonToolbar, IonTitle, IonContent, IonItem,IonInput, IonText,IonButton],

  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPage {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async submit(): Promise<void> {
    this.error = '';

    if (!this.email.trim() || !this.password) {
      this.error = 'Introduce el correo y la contraseña.';
      return;
    }

    this.loading = true;

    try {
      const success = this.auth.login(
        this.email,
        this.password
      );

      if (!success) {
        this.error = 'Correo o contraseña incorrectos.';
        return;
      }

      const destination = this.auth.hasRole('admin')
        ? '/dashboard'
        : '/productos';

      await this.router.navigateByUrl(destination);
    } finally {
      this.loading = false;
    }
  }
}

