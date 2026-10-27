
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton
} from '@ionic/angular';

import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

import {
  ProductosService,
  Producto
} from '../../services/productos.service';

import { AuthService } from '../../services/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    BaseChartDirective
  ]
})
export class DashboardPage implements OnInit {
  productos: Producto[] = [];
  cargando = false;
  mensaje = '';

  categoriasLabels: string[] = [];
  categoriasDatos: number[] = [];

  doughnutChartType: 'doughnut' = 'doughnut';

  doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    },
    cutout: '60%'
  };

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    void this.cargarProductos();
  }

  get totalUnidades(): number {
    return this.productos.reduce(
      (total, producto) => total + producto.cantidad,
      0
    );
  }

  get valorInventario(): number {
    return this.productos.reduce(
      (total, producto) =>
        total + producto.cantidad * producto.precio,
      0
    );
  }

  async cargarProductos(): Promise<void> {
    this.cargando = true;
    this.mensaje = '';

    try {
      this.productos = await this.productosService.obtenerProductos();
      this.actualizarGrafico();
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.productos = [];
      this.mensaje = 'No se pudieron cargar los productos desde Supabase.';
      this.actualizarGrafico();
    } finally {
      this.cargando = false;
    }
  }

  actualizarGrafico(): void {
    const cantidades = new Map<string, number>();

    for (const producto of this.productos) {
      const categoria = producto.categoria || 'Sin categoría';

      cantidades.set(
        categoria,
        (cantidades.get(categoria) ?? 0) + producto.cantidad
      );
    }

    this.categoriasLabels = Array.from(cantidades.keys());
    this.categoriasDatos = Array.from(cantidades.values());
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  }

  abrirProductos(): void {
    void this.router.navigate(['/productos']);
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    void this.router.navigate(['/login']);
  }
}
