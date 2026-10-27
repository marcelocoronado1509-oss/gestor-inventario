
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'admin' | 'user';

export interface UsuarioActual {
  email: string;
  rol: UserRole;
}

interface UsuarioPrueba extends UsuarioActual {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly usuarioActualSubject =
    new BehaviorSubject<UsuarioActual | null>(null);

  readonly usuarioActual$ = this.usuarioActualSubject.asObservable();

  private readonly usuarios: UsuarioPrueba[] = [
    {
      email: 'admin@inventario.com',
      password: 'Admin123!',
      rol: 'admin'
    },
    {
      email: 'usuario@inventario.com',
      password: 'Usuario123!',
      rol: 'user'
    }
  ];

  get isLoggedIn(): boolean {
    return this.usuarioActualSubject.value !== null;
  }

  login(email: string, password: string): boolean {
    return this.iniciarSesion(email, password);
  }

  iniciarSesion(email: string, password: string): boolean {
    const emailNormalizado = email.trim().toLowerCase();

    const usuario = this.usuarios.find(
      (item) =>
        item.email.toLowerCase() === emailNormalizado &&
        item.password === password
    );

    if (!usuario) {
      return false;
    }

    this.usuarioActualSubject.next({
      email: usuario.email,
      rol: usuario.rol
    });

    return true;
  }

  obtenerUsuarioActual(): UsuarioActual | null {
    return this.usuarioActualSubject.value;
  }

  hasRole(requiredRole: UserRole): boolean {
    return this.usuarioActualSubject.value?.rol === requiredRole;
  }

  esAdmin(): boolean {
    return this.hasRole('admin');
  }

  cerrarSesion(): void {
    this.usuarioActualSubject.next(null);
  }

  logout(): void {
    this.cerrarSesion();
  }
}
