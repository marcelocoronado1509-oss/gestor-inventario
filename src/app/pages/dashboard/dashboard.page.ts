
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
import { Chart, registerables, ChartConfiguration } from 'chart.js';

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

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const valor = Number(context.raw ?? 0);
            return ` ${context.label}: ${valor} unidades`;
          }
        }
      }
    },
    cutout: '60%'
  };

  constructor(
    private readonly productosService: ProductosService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    void this.cargarProductos();
  }

  get totalUnidades(): number {
    return this.productos.reduce(
      (total, producto) => total + Number(producto.cantidad || 0),
      0
    );
  }

  get valorInventario(): number {
    return this.productos.reduce(
      (total, producto) =>
        total +
        Number(producto.cantidad || 0) *
        Number(producto.precio || 0),
      0
    );
  }

  async cargarProductos(): Promise<void> {
    this.cargando = true;
    this.mensaje = '';

    try {
      const productos =
        await this.productosService.obtenerProductos();

      this.productos = productos ?? [];
      this.actualizarGrafico();

      console.log(
        'Productos cargados para el dashboard:',
        this.productos.length
      );
      console.log('Categorías del gráfico:', this.categoriasLabels);
      console.log('Datos del gráfico:', this.categoriasDatos);
    } catch (error) {
      console.error('Error al cargar productos:', error);

      this.productos = [];
      this.actualizarGrafico();

      this.mensaje =
        'No se pudieron cargar los productos desde Supabase.';
    } finally {
      this.cargando = false;
    }
  }

  actualizarGrafico(): void {
    const cantidades = new Map<string, number>();

    for (const producto of this.productos) {
      const categoria =
        String(producto.categoria || '').trim() || 'Sin categoría';

      const cantidad = Number(producto.cantidad) || 0;

      cantidades.set(
        categoria,
        (cantidades.get(categoria) ?? 0) + cantidad
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

  async cerrarSesion(): Promise<void> {
    await this.authService.cerrarSesion();
    await this.router.navigateByUrl('/login');
  }
}
