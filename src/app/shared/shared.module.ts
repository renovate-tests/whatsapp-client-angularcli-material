import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {MatButtonModule, MatIconModule} from '@angular/material';
import {ConfirmSelectionComponent} from './component/confirm-selection/confirm-selection.component';

@NgModule({
  declarations: [
    ConfirmSelectionComponent,
  ],
  imports: [
    BrowserModule,
    // Material
    MatIconModule,
    MatButtonModule,
  ],
  providers: [],
  exports: [
    ConfirmSelectionComponent,
  ],
})
export class SharedModule {
}
