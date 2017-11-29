import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import { AppComponent } from './app.component';
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {Apollo, ApolloModule} from 'apollo-angular';
import {HttpClientModule} from '@angular/common/http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {RouterModule, Routes} from '@angular/router';
import {ChatsService} from './services/chats.service';
import {ChatsCreationModule} from './chats-creation/chats-creation.module';
import {ToolbarModule} from './toolbar/toolbar.module';
import {ChatViewerModule} from './chat-viewer/chat-viewer.module';
import {ChatsListerModule} from './chats-lister/chats-lister.module';

const routes: Routes = [
  {path: '', redirectTo: 'chats', pathMatch: 'full'},
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    // Apollo
    ApolloModule,
    HttpLinkModule,
    HttpClientModule,
    // Routing
    RouterModule.forRoot(routes),
    // Feature modules
    ToolbarModule,
    ChatsCreationModule,
    ChatViewerModule,
    ChatsListerModule,
  ],
  providers: [
    ChatsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink,
  ) {
    /*const GRAPHQL_ENDPOINT = 'ws://localhost/graphql_live';
    const client = new SubscriptionClient(GRAPHQL_ENDPOINT, {
      reconnect: true,
    });*/

    apollo.create({
      link: httpLink.create({uri: 'http://localhost:3000/graphql'}),
      // link: new WebSocketLink(client),
      cache: new InMemoryCache()
    });
  }
}
