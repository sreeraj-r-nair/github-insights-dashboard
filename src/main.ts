import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AuthGuard } from './app/core/services/auth.guard';
import { provideAnimations } from '@angular/platform-browser/animations';
import { defineCustomElements } from '@scania/tegel/loader';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    AuthGuard,
    provideAnimations(), provideAnimationsAsync()
  ]
}).catch(err => console.error(err));
