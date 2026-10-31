
import { bootstrapApplication } from '@angular/platform-browser';

import {
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules
} from '@angular/router';

import {
  IonicRouteStrategy,
  provideIonicAngular
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  shieldCheckmarkOutline,
  chevronForwardOutline,
  personOutline,
  cubeOutline
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Registrar los iconos utilizados por la aplicación
addIcons({
  'shield-checkmark-outline': shieldCheckmarkOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'person-outline': personOutline,
  'cube-outline': cubeOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    provideIonicAngular(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding()
    )
  ]
});
