
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AlertController
} from '@ionic/angular';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonSpinner,
  IonText
} from '@ionic/angular';

import {
  ProductosService,
  Producto,
  NuevoProducto
} from '../../services/productos.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonSearchbar,
    IonSpinner,
    IonText
  ]
})
export class ProductosPage implements OnInit {
  productos: Producto[] = [];

  cargando = false;
  mensaje = '';
  busqueda = '';
  categoriaSeleccionada = 'Todas';

  editandoId: number | null = null;

  formulario: NuevoProducto = {
    nombre: '',
    categoria: '',
    cantidad: 0,
    precio: 0
  };

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    void this.cargarProductos();
  }

  get esAdmin(): boolean {
    return this.authService.esAdmin();
  }

  get productosConStockBajo(): number {
    return this.productos.filter(
      producto => producto.cantidad <= 5
    ).length;
  }

  get categorias(): string[] {
    return [
      ...new Set(this.productos.map(producto => producto.categoria))
    ];
  }

  get productosFiltrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.productos.filter(producto => {
      const coincideTexto =
        producto.nombre.toLowerCase().includes(texto) ||
        producto.categoria.toLowerCase().includes(texto);

      const coincideCategoria =
        this.categoriaSeleccionada === 'Todas' ||
        producto.categoria === this.categoriaSeleccionada;

      return coincideTexto && coincideCategoria;
    });
  }

  async cargarProductos(): Promise<void> {
    this.cargando = true;
    this.mensaje = '';

    try {
      this.productos = await this.productosService.obtenerProductos();
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.mensaje = 'No se pudieron cargar los productos desde Supabase.';
    } finally {
      this.cargando = false;
    }
  }

  async guardarProducto(): Promise<void> {
    if (!this.esAdmin) {
      this.mensaje = 'No tienes permisos para gestionar productos.';
      return;
    }

    const nombre = this.formulario.nombre.trim();
    const categoria = this.formulario.categoria.trim();
    const cantidad = Number(this.formulario.cantidad);
    const precio = Number(this.formulario.precio);

    if (!nombre || !categoria) {
      this.mensaje = 'El nombre y la categoría son obligatorios.';
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad < 0) {
      this.mensaje = 'La cantidad debe ser un entero igual o mayor que cero.';
      return;
    }

    if (!Number.isFinite(precio) || precio < 0) {
      this.mensaje = 'El precio debe ser igual o mayor que cero.';
      return;
    }

    const datos: NuevoProducto = {
      nombre,
      categoria,
      cantidad,
      precio
    };

    this.cargando = true;
    this.mensaje = '';

    try {
      if (this.editandoId !== null) {
        await this.productosService.actualizarProducto({
          id: this.editandoId,
          ...datos
        });

        this.mensaje = 'Producto actualizado correctamente.';
      } else {
        await this.productosService.agregarProducto(datos);
        this.mensaje = 'Producto añadido correctamente.';
      }

      this.cancelarEdicion();
      await this.cargarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      this.mensaje =
        'No se pudo guardar el producto. Comprueba las políticas de Supabase.';
    } finally {
      this.cargando = false;
    }
  }

  editarProducto(producto: Producto): void {
    if (!this.esAdmin) {
      this.mensaje = 'No tienes permisos para editar productos.';
      return;
    }

    this.formulario = {
      nombre: producto.nombre,
      categoria: producto.categoria,
      cantidad: producto.cantidad,
      precio: producto.precio
    };

    this.editandoId = producto.id;
    this.mensaje = '';
  }

  cancelarEdicion(): void {
    this.formulario = {
      nombre: '',
      categoria: '',
      cantidad: 0,
      precio: 0
    };

    this.editandoId = null;
  }

  async eliminarProducto(producto: Producto): Promise<void> {
    if (!this.esAdmin) {
      this.mensaje = 'No tienes permisos para eliminar productos.';
      return;
    }

    const alerta = await this.alertController.create({
      header: 'Eliminar producto',
      message: `¿Seguro que quieres eliminar "${producto.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            void this.confirmarEliminacion(producto.id);
          }
        }
      ]
    });

    await alerta.present();
  }

  private async confirmarEliminacion(id: number): Promise<void> {
    this.cargando = true;

    try {
      await this.productosService.eliminarProducto(id);
      this.mensaje = 'Producto eliminado correctamente.';
      await this.cargarProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      this.mensaje =
        'No se pudo eliminar el producto. Comprueba las políticas de Supabase.';
    } finally {
      this.cargando = false;
    }
  }
}
