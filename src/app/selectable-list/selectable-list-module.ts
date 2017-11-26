import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {MatButtonModule, MatIconModule} from '@angular/material';
import {SelectableItemDirective} from './directive/selectable-item/selectable-item.directive';
import {SelectableListDirective} from './directive/selectable-list/selectable-list.directive';
import {ConfirmSelectionComponent} from './component/confirm-selection/confirm-selection.component';

@NgModule({
  declarations: [
    ConfirmSelectionComponent,
    // Directives
    SelectableItemDirective,
    SelectableListDirective,
  ],
  imports: [
    BrowserModule,
    // Material
    MatIconModule,
    MatButtonModule,
  ],
  providers: [],
  entryComponents: [
    ConfirmSelectionComponent,
  ],
  exports: [
    SelectableItemDirective,
    SelectableListDirective,
  ],
})
export class SelectableListModule {
}
