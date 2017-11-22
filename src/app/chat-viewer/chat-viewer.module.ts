import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ChatsService} from '../services/chats.service';
import {ToolbarModule} from '../toolbar/toolbar.module';
import {ChatComponent} from './containers/chat/chat.component';
import {MessagesListComponent} from './components/messages-list/messages-list.component';
import {MessageItemComponent} from './components/message-item/message-item.component';
import {NewMessageComponent} from './components/new-message/new-message.component';

const routes: Routes = [
  {
    path: 'chat', children: [
      {path: ':id', component: ChatComponent},
    ],
  },
];

@NgModule({
  declarations: [
    ChatComponent,
    MessagesListComponent,
    MessageItemComponent,
    NewMessageComponent,
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
    // Feature modules
    ToolbarModule,
  ],
  providers: [
    ChatsService,
  ],
})
export class ChatViewerModule {
}
