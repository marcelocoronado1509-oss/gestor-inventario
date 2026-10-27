
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'admin' | 'user';

export interface UsuarioActual {
  email: string;
  rol: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioActualSubject =
    new BehaviorSubject<UsuarioActual | null>(null);

  usuarioActual$ = this.usuarioActualSubject.asObservable();

  private usuarios = [
    {
      email: 'admin@inventario.com',
      password: 'Admin123!',
      rol: 'admin' as UserRole
    },
    {
      email: 'usuario@inventario.com',
      password: 'Usuario123!',
      rol: 'user' as UserRole
    }
  ];

  // Compatible con el método que utiliza tu página de login.
  login(email: string, password: string): boolean {
    return this.iniciarSesion(email, password);
  }

  // Inicio de sesión.
  iniciarSesion(email: string, password: string): boolean {
    const usuario = this.usuarios.find(
      u => u.email === email && u.password === password
    );

    if (!usuario) {
      this.usuarioActualSubject.next(null);
      return false;
    }

    this.usuarioActualSubject.next({
      email: usuario.email,
      rol: usuario.rol
    });

    return true;
  }

  // Usuario que tiene la sesión iniciada.
  obtenerUsuarioActual(): UsuarioActual | null {
    return this.usuarioActualSubject.value;
  }

  // Compatible con el guard existente.
  get isLoggedIn(): boolean {
    return this.usuarioActualSubject.value !== null;
  }

  // Comprueba el rol del usuario.
  hasRole(requiredRole: UserRole): boolean {
    return this.usuarioActualSubject.value?.rol === requiredRole;
  }

  // Método alternativo para comprobar si es administrador.
  esAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Cerrar sesión.
  cerrarSesion(): void {
    this.usuarioActualSubject.next(null);
  }

  // Alias por si algún componente usa este nombre.
  logout(): void {
    this.cerrarSesion();
  }
}
