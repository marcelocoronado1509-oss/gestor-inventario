
import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  cantidad: number;
  precio: number;
  created_at?: string;
}

export type NuevoProducto = Omit<Producto, 'id' | 'created_at'>;

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  async obtenerProductos(): Promise<Producto[]> {

    // Comprobar la sesión del usuario
    const { data: sesion, error: errorSesion } =
      await supabase.auth.getSession();

    console.log('Usuario autenticado:', sesion.session?.user?.email);
    console.log(
      'Rol del usuario:',
      sesion.session?.user?.user_metadata?.['rol']
    );

    if (errorSesion) {
      console.error('Error al comprobar la sesión:', errorSesion);
    }

    // Consultar los productos
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: true });

    console.log('Productos recibidos:', data);
    console.log('Error de Supabase:', error);

    if (error) {
      console.error('Error al obtener productos:', error.message);
      throw error;
    }

    return (data ?? []) as Producto[];
  }

  async agregarProducto(datos: NuevoProducto): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .insert({
        nombre: datos.nombre,
        categoria: datos.categoria,
        cantidad: datos.cantidad,
        precio: datos.precio
      })
      .select()
      .single();

    if (error) {
      console.error('Error al añadir producto:', error.message);
      throw error;
    }

    return data as Producto;
  }

  async actualizarProducto(producto: Producto): Promise<Producto> {
    const { id, nombre, categoria, cantidad, precio } = producto;

    const { data, error } = await supabase
      .from('productos')
      .update({ nombre, categoria, cantidad, precio })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar producto:', error.message);
      throw error;
    }

    return data as Producto;
  }

  async eliminarProducto(id: number): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar producto:', error.message);
      throw error;
    }
  }
}
