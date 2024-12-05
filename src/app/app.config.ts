import {
  ApplicationConfig,
  provideExperimentalZonelessChangeDetection,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(), // bye bye zone :)
    provideRouter(routes),
    provideHttpClient(),
  ],
};
