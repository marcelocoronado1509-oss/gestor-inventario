
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { supabase } from './supabase.client';

export type UserRole = 'admin' | 'user';

export interface UsuarioActual {
  email: string;
  rol: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly usuarioActualSubject =
    new BehaviorSubject<UsuarioActual | null>(null);

  readonly usuarioActual$ = this.usuarioActualSubject.asObservable();

  private inicializacion: Promise<void> | null = null;

  constructor() {
    // Recupera la sesión guardada por Supabase al abrir la aplicación.
    this.inicializacion = this.cargarSesion();

    // Mantiene actualizado el usuario cuando cambia la sesión.
    supabase.auth.onAuthStateChange((_event, session) => {
      this.usuarioActualSubject.next(
        session?.user
          ? this.convertirUsuario(session.user)
          : null
      );
    });
  }

  get isLoggedIn(): boolean {
    return this.usuarioActualSubject.value !== null;
  }

  async inicializarSesion(): Promise<void> {
    if (this.inicializacion) {
      await this.inicializacion;
    }
  }

  private async cargarSesion(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      this.usuarioActualSubject.next(
        data.session?.user
          ? this.convertirUsuario(data.session.user)
          : null
      );
    } catch (error) {
      console.error('Error al recuperar la sesión:', error);
      this.usuarioActualSubject.next(null);
    }
  }

  private convertirUsuario(user: {
    email?: string;
    user_metadata?: Record<string, unknown>;
  }): UsuarioActual {
    const rol = user.user_metadata?.['rol'];

    return {
      email: user.email ?? '',
      rol: rol === 'admin' ? 'admin' : 'user'
    };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        console.error('Error de Supabase:', error.message);

        return {
          ok: false,
          error: 'Correo o contraseña incorrectos. Comprueba también que el usuario esté confirmado en Supabase.'
        };
      }

      if (!data.user) {
        return {
          ok: false,
          error: 'Supabase no ha devuelto ningún usuario.'
        };
      }

      this.usuarioActualSubject.next(
        this.convertirUsuario(data.user)
      );

      return { ok: true };
    } catch (error) {
      console.error('Error de conexión:', error);

      return {
        ok: false,
        error: 'No se ha podido conectar con Supabase. Comprueba la URL, la clave pública y tu conexión.'
      };
    }
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

  async cerrarSesion(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error al cerrar sesión:', error.message);
      }
    } finally {
      this.usuarioActualSubject.next(null);
    }
  }

  async logout(): Promise<void> {
    await this.cerrarSesion();
  }
}

