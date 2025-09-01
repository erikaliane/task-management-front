import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';


fetch('/assets/config.json')
  .then(response => response.json())
  .then(config => {
    environment.apiUrl = config.apiUrl; // Sobrescribe el valor dinámicamente

    if (environment.production) {
      enableProdMode();
    }

    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.error(err));
  });
