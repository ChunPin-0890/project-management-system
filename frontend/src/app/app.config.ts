// App-wide providers — the standalone-era replacement for AppModule; like ConfigureServices
// in ASP.NET Core (register router, HttpClient and its interceptor pipeline).
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([jwtInterceptor]))],
};
