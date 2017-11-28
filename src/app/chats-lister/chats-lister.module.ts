import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ChatsService} from '../services/chats.service';
import {ToolbarModule} from '../toolbar/toolbar.module';
import {ChatItemComponent} from './components/chat-item/chat-item.component';
import {ChatsComponent} from './containers/chats/chats.component';
import {ChatsListComponent} from './components/chats-list/chats-list.component';
import {TruncateModule} from 'ng2-truncate';
import {SelectableListModule} from '../selectable-list/selectable-list-module';
import {SharedModule} from '../shared/shared.module';

const routes: Routes = [
  {path: 'chats', component: ChatsComponent},
];

@NgModule({
  declarations: [
    ChatsComponent,
    ChatsListComponent,
    ChatItemComponent,
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
    // Truncate Pipe
    TruncateModule,
    // Feature modules
    ToolbarModule,
    SelectableListModule,
    SharedModule,
  ],
  providers: [
    ChatsService,
  ],
})
export class ChatsListerModule {
}
