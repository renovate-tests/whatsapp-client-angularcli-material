import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ToolbarComponent} from './components/toolbar/toolbar.component';

const routes: Routes = [
];

@NgModule({
  declarations: [
    ToolbarComponent,
  ],
  imports: [
    BrowserModule,
    // Animations (for Material)
    BrowserAnimationsModule,
    // Material
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatGridListModule,
    // Routing
    RouterModule.forChild(routes),
    // Forms
    FormsModule,
  ],
  providers: [],
  exports: [
    ToolbarComponent,
  ],
})
export class ToolbarModule {
}
