// Bootstrap — like ReactDOM.createRoot(...).render(<App/>) or Program.cs; standalone components
// mean no NgModule: providers are registered in app.config.ts instead.
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
