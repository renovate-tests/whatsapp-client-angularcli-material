# Step 9: Zero latency on slow 3g networks

[//]: # (head-end)


# Chapter 5

Now we can concentrate on the client and bootstrap it using angular-cli:

    $ ng new client --style scss

Time to install a couple of packages:

    $ npm install apollo-angular apollo-angular-link-http apollo-cache-inmemory apollo-client apollo-link graphql graphql-tag

Import Apollo client from our `app.module`:

[{]: <helper> (diffStep "1.1" files="app.module.ts")

#### Step 1.1: Add angular-apollo to app module

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -3,6 +3,10 @@
 ┊ 3┊ 3┊
 ┊ 4┊ 4┊
 ┊ 5┊ 5┊import { AppComponent } from './app.component';
+┊  ┊ 6┊import {HttpClientModule} from '@angular/common/http';
+┊  ┊ 7┊import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
+┊  ┊ 8┊import {Apollo, ApolloModule} from 'apollo-angular';
+┊  ┊ 9┊import {InMemoryCache} from 'apollo-cache-inmemory';
 ┊ 6┊10┊
 ┊ 7┊11┊
 ┊ 8┊12┊@NgModule({
```
```diff
@@ -10,9 +14,23 @@
 ┊10┊14┊    AppComponent
 ┊11┊15┊  ],
 ┊12┊16┊  imports: [
-┊13┊  ┊    BrowserModule
+┊  ┊17┊    BrowserModule,
+┊  ┊18┊    // Apollo
+┊  ┊19┊    ApolloModule,
+┊  ┊20┊    HttpLinkModule,
+┊  ┊21┊    HttpClientModule,
 ┊14┊22┊  ],
 ┊15┊23┊  providers: [],
 ┊16┊24┊  bootstrap: [AppComponent]
 ┊17┊25┊})
-┊18┊  ┊export class AppModule { }
+┊  ┊26┊export class AppModule {
+┊  ┊27┊  constructor(
+┊  ┊28┊    apollo: Apollo,
+┊  ┊29┊    httpLink: HttpLink,
+┊  ┊30┊  ) {
+┊  ┊31┊    apollo.create({
+┊  ┊32┊      link: httpLink.create({uri: 'http://localhost:3000/graphql'}),
+┊  ┊33┊      cache: new InMemoryCache()
+┊  ┊34┊    });
+┊  ┊35┊  }
+┊  ┊36┊}
```

[}]: #

Let's create a simple service to query the chats from our just created server:

[{]: <helper> (diffStep "1.2")

#### Step 1.2: Add chats service

##### Added src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -0,0 +1,22 @@
+┊  ┊ 1┊import {ApolloQueryResult} from 'apollo-client';
+┊  ┊ 2┊import {map} from 'rxjs/operators';
+┊  ┊ 3┊import {Apollo} from 'apollo-angular';
+┊  ┊ 4┊import {Injectable} from '@angular/core';
+┊  ┊ 5┊import {getChatsQuery} from '../../graphql/getChats.query';
+┊  ┊ 6┊
+┊  ┊ 7┊@Injectable()
+┊  ┊ 8┊export class ChatsService {
+┊  ┊ 9┊
+┊  ┊10┊  constructor(private apollo: Apollo) {}
+┊  ┊11┊
+┊  ┊12┊  getChats() {
+┊  ┊13┊    const query = this.apollo.watchQuery<any>({
+┊  ┊14┊      query: getChatsQuery
+┊  ┊15┊    });
+┊  ┊16┊    const chats$ = query.valueChanges.pipe(
+┊  ┊17┊      map((result: ApolloQueryResult<any>) => result.data.chats)
+┊  ┊18┊    );
+┊  ┊19┊
+┊  ┊20┊    return {query, chats$};
+┊  ┊21┊  }
+┊  ┊22┊}
```

##### Added src&#x2F;graphql&#x2F;getChats.query.ts
```diff
@@ -0,0 +1,36 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊
+┊  ┊ 3┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 4┊export const getChatsQuery = gql`
+┊  ┊ 5┊  query GetChats {
+┊  ┊ 6┊    chats {
+┊  ┊ 7┊      id,
+┊  ┊ 8┊      __typename,
+┊  ┊ 9┊      name,
+┊  ┊10┊      picture,
+┊  ┊11┊      userIds,
+┊  ┊12┊      unreadMessages,
+┊  ┊13┊      lastMessage {
+┊  ┊14┊        id,
+┊  ┊15┊        __typename,
+┊  ┊16┊        senderId,
+┊  ┊17┊        sender {
+┊  ┊18┊          id,
+┊  ┊19┊          __typename,
+┊  ┊20┊          name,
+┊  ┊21┊        },
+┊  ┊22┊        content,
+┊  ┊23┊        createdAt,
+┊  ┊24┊        type,
+┊  ┊25┊        recipients {
+┊  ┊26┊          id,
+┊  ┊27┊          __typename,
+┊  ┊28┊          receivedAt,
+┊  ┊29┊          readAt,
+┊  ┊30┊        },
+┊  ┊31┊        ownership,
+┊  ┊32┊      },
+┊  ┊33┊      isGroup,
+┊  ┊34┊    }
+┊  ┊35┊  }
+┊  ┊36┊`;
```

[}]: #

We will use Materials for the UI, so let's install it:

    $ npm install @angular/cdk @angular/material hammerjs ng2-truncate

Let's configure Material:

[{]: <helper> (diffStep "1.3" files="src/index.ts, src/main.ts, src/styles.scss")

#### Step 1.3: List the chats

##### Changed src&#x2F;main.ts
```diff
@@ -4,6 +4,9 @@
 ┊ 4┊ 4┊import { AppModule } from './app/app.module';
 ┊ 5┊ 5┊import { environment } from './environments/environment';
 ┊ 6┊ 6┊
+┊  ┊ 7┊// Material gestures
+┊  ┊ 8┊import 'hammerjs';
+┊  ┊ 9┊
 ┊ 7┊10┊if (environment.production) {
 ┊ 8┊11┊  enableProdMode();
 ┊ 9┊12┊}
```

##### Changed src&#x2F;styles.scss
```diff
@@ -1 +1,8 @@
 ┊1┊1┊/* You can add global styles to this file, and also import other style files */
+┊ ┊2┊
+┊ ┊3┊/* Meterial theme */
+┊ ┊4┊@import "~@angular/material/prebuilt-themes/indigo-pink.css";
+┊ ┊5┊
+┊ ┊6┊body {
+┊ ┊7┊  margin: 0;
+┊ ┊8┊}
```

[}]: #

We're now creating a `shared` module where we will define our header component where we're going to project a different content from each component:

[{]: <helper> (diffStep "1.3" files="src/app/shared/*")

#### Step 1.3: List the chats

##### Added src&#x2F;app&#x2F;shared&#x2F;components&#x2F;toolbar&#x2F;toolbar.component.scss
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: block;
+┊  ┊ 3┊  height: 8vh;
+┊  ┊ 4┊}
+┊  ┊ 5┊
+┊  ┊ 6┊.mat-toolbar {
+┊  ┊ 7┊  justify-content: space-between;
+┊  ┊ 8┊  height: 100%;
+┊  ┊ 9┊
+┊  ┊10┊  .left-block {
+┊  ┊11┊    display: flex;
+┊  ┊12┊  }
+┊  ┊13┊}
```

##### Added src&#x2F;app&#x2F;shared&#x2F;components&#x2F;toolbar&#x2F;toolbar.component.ts
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊import {Component} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-toolbar',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <mat-toolbar>
+┊  ┊ 7┊      <div class="left-block">
+┊  ┊ 8┊        <ng-content select=".navigation"></ng-content>
+┊  ┊ 9┊        <ng-content select=".title"></ng-content>
+┊  ┊10┊      </div>
+┊  ┊11┊      <ng-content select=".menu"></ng-content>
+┊  ┊12┊    </mat-toolbar>
+┊  ┊13┊  `,
+┊  ┊14┊  styleUrls: ['./toolbar.component.scss']
+┊  ┊15┊})
+┊  ┊16┊export class ToolbarComponent {
+┊  ┊17┊
+┊  ┊18┊}
```

##### Added src&#x2F;app&#x2F;shared&#x2F;shared.module.ts
```diff
@@ -0,0 +1,28 @@
+┊  ┊ 1┊import {BrowserModule} from '@angular/platform-browser';
+┊  ┊ 2┊import {NgModule} from '@angular/core';
+┊  ┊ 3┊
+┊  ┊ 4┊import {MatToolbarModule} from '@angular/material';
+┊  ┊ 5┊import {ToolbarComponent} from './components/toolbar/toolbar.component';
+┊  ┊ 6┊import {FormsModule} from '@angular/forms';
+┊  ┊ 7┊import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
+┊  ┊ 8┊
+┊  ┊ 9┊@NgModule({
+┊  ┊10┊  declarations: [
+┊  ┊11┊    ToolbarComponent,
+┊  ┊12┊  ],
+┊  ┊13┊  imports: [
+┊  ┊14┊    BrowserModule,
+┊  ┊15┊    // Material
+┊  ┊16┊    MatToolbarModule,
+┊  ┊17┊    // Animations
+┊  ┊18┊    BrowserAnimationsModule,
+┊  ┊19┊    // Forms
+┊  ┊20┊    FormsModule,
+┊  ┊21┊  ],
+┊  ┊22┊  providers: [],
+┊  ┊23┊  exports: [
+┊  ┊24┊    ToolbarComponent,
+┊  ┊25┊  ],
+┊  ┊26┊})
+┊  ┊27┊export class SharedModule {
+┊  ┊28┊}
```

[}]: #

Now we want to create the `chats-lister` module, with a container component called `ChatsComponent` and a couple of presentational components.

[{]: <helper> (diffStep "1.3" files="src/app/chats-lister/*")

#### Step 1.3: List the chats

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;chats-lister.module.ts
```diff
@@ -0,0 +1,48 @@
+┊  ┊ 1┊import { BrowserModule } from '@angular/platform-browser';
+┊  ┊ 2┊import { NgModule } from '@angular/core';
+┊  ┊ 3┊
+┊  ┊ 4┊import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
+┊  ┊ 5┊import {MatButtonModule, MatIconModule, MatListModule, MatMenuModule} from '@angular/material';
+┊  ┊ 6┊import {RouterModule, Routes} from '@angular/router';
+┊  ┊ 7┊import {FormsModule} from '@angular/forms';
+┊  ┊ 8┊import {ChatsService} from '../services/chats.service';
+┊  ┊ 9┊import {ChatItemComponent} from './components/chat-item/chat-item.component';
+┊  ┊10┊import {ChatsComponent} from './containers/chats/chats.component';
+┊  ┊11┊import {ChatsListComponent} from './components/chats-list/chats-list.component';
+┊  ┊12┊import {TruncateModule} from 'ng2-truncate';
+┊  ┊13┊import {SharedModule} from '../shared/shared.module';
+┊  ┊14┊
+┊  ┊15┊const routes: Routes = [
+┊  ┊16┊  {path: 'chats', component: ChatsComponent},
+┊  ┊17┊];
+┊  ┊18┊
+┊  ┊19┊@NgModule({
+┊  ┊20┊  declarations: [
+┊  ┊21┊    ChatsComponent,
+┊  ┊22┊    ChatsListComponent,
+┊  ┊23┊    ChatItemComponent,
+┊  ┊24┊  ],
+┊  ┊25┊  imports: [
+┊  ┊26┊    BrowserModule,
+┊  ┊27┊    // Material
+┊  ┊28┊    MatMenuModule,
+┊  ┊29┊    MatIconModule,
+┊  ┊30┊    MatButtonModule,
+┊  ┊31┊    MatListModule,
+┊  ┊32┊    // Animations
+┊  ┊33┊    BrowserAnimationsModule,
+┊  ┊34┊    // Routing
+┊  ┊35┊    RouterModule.forChild(routes),
+┊  ┊36┊    // Forms
+┊  ┊37┊    FormsModule,
+┊  ┊38┊    // Truncate Pipe
+┊  ┊39┊    TruncateModule,
+┊  ┊40┊    // Feature modules
+┊  ┊41┊    SharedModule,
+┊  ┊42┊  ],
+┊  ┊43┊  providers: [
+┊  ┊44┊    ChatsService,
+┊  ┊45┊  ],
+┊  ┊46┊})
+┊  ┊47┊export class ChatsListerModule {
+┊  ┊48┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.scss
```diff
@@ -0,0 +1,17 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: block;
+┊  ┊ 3┊  width: 100%;
+┊  ┊ 4┊}
+┊  ┊ 5┊
+┊  ┊ 6┊.chat-row {
+┊  ┊ 7┊  padding: 0;
+┊  ┊ 8┊  display: flex;
+┊  ┊ 9┊  width: 100%;
+┊  ┊10┊  justify-content: space-between;
+┊  ┊11┊  align-items: center;
+┊  ┊12┊
+┊  ┊13┊  .chat-recipient {
+┊  ┊14┊    display: flex;
+┊  ┊15┊    width: 60%;
+┊  ┊16┊  }
+┊  ┊17┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.ts
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-chat-item',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <div class="chat-row">
+┊  ┊ 7┊        <div class="chat-recipient">
+┊  ┊ 8┊          <img *ngIf="chat.picture" [src]="chat.picture" width="48" height="48">
+┊  ┊ 9┊          <div>{{ chat.name }} [id: {{ chat.id }}]</div>
+┊  ┊10┊        </div>
+┊  ┊11┊        <div class="chat-content">{{ chat.lastMessage?.content | truncate : 20 : '...' }}</div>
+┊  ┊12┊    </div>
+┊  ┊13┊  `,
+┊  ┊14┊  styleUrls: ['chat-item.component.scss'],
+┊  ┊15┊})
+┊  ┊16┊export class ChatItemComponent {
+┊  ┊17┊  // tslint:disable-next-line:no-input-rename
+┊  ┊18┊  @Input('item')
+┊  ┊19┊  chat: any;
+┊  ┊20┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chats-list&#x2F;chats-list.component.scss
```diff
@@ -0,0 +1,3 @@
+┊ ┊1┊:host {
+┊ ┊2┊  display: block;
+┊ ┊3┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chats-list&#x2F;chats-list.component.ts
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-chats-list',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <mat-list>
+┊  ┊ 7┊      <mat-list-item *ngFor="let chat of chats">
+┊  ┊ 8┊        <app-chat-item [item]="chat"></app-chat-item>
+┊  ┊ 9┊      </mat-list-item>
+┊  ┊10┊    </mat-list>
+┊  ┊11┊  `,
+┊  ┊12┊  styleUrls: ['chats-list.component.scss'],
+┊  ┊13┊})
+┊  ┊14┊export class ChatsListComponent {
+┊  ┊15┊  // tslint:disable-next-line:no-input-rename
+┊  ┊16┊  @Input('items')
+┊  ┊17┊  chats: any[];
+┊  ┊18┊
+┊  ┊19┊  constructor() {}
+┊  ┊20┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.scss
```diff
@@ -0,0 +1,5 @@
+┊ ┊1┊.chat-button {
+┊ ┊2┊  position: absolute;
+┊ ┊3┊  bottom: 5vw;
+┊ ┊4┊  right: 5vw;
+┊ ┊5┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.ts
```diff
@@ -0,0 +1,46 @@
+┊  ┊ 1┊import {Component, OnInit} from '@angular/core';
+┊  ┊ 2┊import {ChatsService} from '../../../services/chats.service';
+┊  ┊ 3┊import {Observable} from 'rxjs/Observable';
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  template: `
+┊  ┊ 7┊    <app-toolbar>
+┊  ┊ 8┊      <div class="title">Whatsapp Clone</div>
+┊  ┊ 9┊      <button mat-icon-button [matMenuTriggerFor]="menu" class="menu">
+┊  ┊10┊        <mat-icon>more_vert</mat-icon>
+┊  ┊11┊      </button>
+┊  ┊12┊    </app-toolbar>
+┊  ┊13┊
+┊  ┊14┊    <mat-menu #menu="matMenu">
+┊  ┊15┊      <button mat-menu-item>
+┊  ┊16┊        <mat-icon>dialpad</mat-icon>
+┊  ┊17┊        <span>Redial</span>
+┊  ┊18┊      </button>
+┊  ┊19┊      <button mat-menu-item disabled>
+┊  ┊20┊        <mat-icon>voicemail</mat-icon>
+┊  ┊21┊        <span>Check voicemail</span>
+┊  ┊22┊      </button>
+┊  ┊23┊      <button mat-menu-item>
+┊  ┊24┊        <mat-icon>notifications_off</mat-icon>
+┊  ┊25┊        <span>Disable alerts</span>
+┊  ┊26┊      </button>
+┊  ┊27┊    </mat-menu>
+┊  ┊28┊
+┊  ┊29┊    <app-chats-list [items]="chats$ | async"></app-chats-list>
+┊  ┊30┊
+┊  ┊31┊    <button class="chat-button" mat-fab color="primary">
+┊  ┊32┊      <mat-icon aria-label="Icon-button with a + icon">add</mat-icon>
+┊  ┊33┊    </button>
+┊  ┊34┊  `,
+┊  ┊35┊  styleUrls: ['./chats.component.scss'],
+┊  ┊36┊})
+┊  ┊37┊export class ChatsComponent implements OnInit {
+┊  ┊38┊  chats$: Observable<any[]>;
+┊  ┊39┊
+┊  ┊40┊  constructor(private chatsService: ChatsService) {
+┊  ┊41┊  }
+┊  ┊42┊
+┊  ┊43┊  ngOnInit() {
+┊  ┊44┊    this.chats$ = this.chatsService.getChats().chats$;
+┊  ┊45┊  }
+┊  ┊46┊}
```

[}]: #

Finally let's wire everything up to the main module:

[{]: <helper> (diffStep "1.3" files="src/app/app.component.ts, src/app/app.module.ts")

#### Step 1.3: List the chats

##### Changed src&#x2F;app&#x2F;app.component.ts
```diff
@@ -2,7 +2,9 @@
 ┊ 2┊ 2┊
 ┊ 3┊ 3┊@Component({
 ┊ 4┊ 4┊  selector: 'app-root',
-┊ 5┊  ┊  templateUrl: './app.component.html',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <router-outlet></router-outlet>
+┊  ┊ 7┊  `,
 ┊ 6┊ 8┊  styleUrls: ['./app.component.scss']
 ┊ 7┊ 9┊})
 ┊ 8┊10┊export class AppComponent {
```

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -7,7 +7,12 @@
 ┊ 7┊ 7┊import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
 ┊ 8┊ 8┊import {Apollo, ApolloModule} from 'apollo-angular';
 ┊ 9┊ 9┊import {InMemoryCache} from 'apollo-cache-inmemory';
+┊  ┊10┊import {ChatsListerModule} from './chats-lister/chats-lister.module';
+┊  ┊11┊import {RouterModule, Routes} from '@angular/router';
 ┊10┊12┊
+┊  ┊13┊const routes: Routes = [
+┊  ┊14┊  {path: '', redirectTo: 'chats', pathMatch: 'full'},
+┊  ┊15┊];
 ┊11┊16┊
 ┊12┊17┊@NgModule({
 ┊13┊18┊  declarations: [
```
```diff
@@ -19,6 +24,10 @@
 ┊19┊24┊    ApolloModule,
 ┊20┊25┊    HttpLinkModule,
 ┊21┊26┊    HttpClientModule,
+┊  ┊27┊    // Routing
+┊  ┊28┊    RouterModule.forRoot(routes),
+┊  ┊29┊    // Feature modules
+┊  ┊30┊    ChatsListerModule,
 ┊22┊31┊  ],
 ┊23┊32┊  providers: [],
 ┊24┊33┊  bootstrap: [AppComponent]
```

[}]: #

# Chapter 6

Let's do the same on the client:

$ npm install graphql-code-generator

[{]: <helper> (diffStep "2.1")

#### Step 2.1: Install graphql-code-generator

##### Changed package.json
```diff
@@ -44,6 +44,7 @@
 ┊44┊44┊    "@types/jasminewd2": "2.0.3",
 ┊45┊45┊    "@types/node": "6.0.96",
 ┊46┊46┊    "codelyzer": "4.1.0",
+┊  ┊47┊    "graphql-code-generator": "0.8.14",
 ┊47┊48┊    "jasmine-core": "2.8.0",
 ┊48┊49┊    "jasmine-spec-reporter": "4.2.1",
 ┊49┊50┊    "karma": "2.0.0",
```

[}]: #

Those are our generated types:
[{]: <helper> (diffStep "2.2")

#### Step 2.2: Run generator

##### Added src&#x2F;types.d.ts
```diff
@@ -0,0 +1,156 @@
+┊   ┊  1┊/* tslint:disable */
+┊   ┊  2┊
+┊   ┊  3┊export interface Query {
+┊   ┊  4┊  users: User[]; 
+┊   ┊  5┊  chats: Chat[]; 
+┊   ┊  6┊  chat?: Chat | null; 
+┊   ┊  7┊}
+┊   ┊  8┊
+┊   ┊  9┊export interface User {
+┊   ┊ 10┊  id: string; 
+┊   ┊ 11┊  name?: string | null; 
+┊   ┊ 12┊  picture?: string | null; 
+┊   ┊ 13┊  phone?: string | null; 
+┊   ┊ 14┊}
+┊   ┊ 15┊
+┊   ┊ 16┊export interface Chat {
+┊   ┊ 17┊  id: string; /* May be a chat or a group */
+┊   ┊ 18┊  name?: string | null; /* Computed for chats */
+┊   ┊ 19┊  picture?: string | null; /* Computed for chats */
+┊   ┊ 20┊  userIds: string[]; /* All members, current and past ones. */
+┊   ┊ 21┊  listingIds: string[]; /* Whoever gets the chat listed. For groups includes past members who still didn&#x27;t delete the group. */
+┊   ┊ 22┊  memberIds: string[]; /* Actual members of the group (they are not the only ones who get the group listed). Null for chats. */
+┊   ┊ 23┊  adminIds: string[]; /* Null for chats */
+┊   ┊ 24┊  ownerId: string; /* If null the group is read-only. Null for chats. */
+┊   ┊ 25┊  messages: Message[]; 
+┊   ┊ 26┊  lastMessage?: Message | null; /* Computed property */
+┊   ┊ 27┊  unreadMessages: number; /* Computed property */
+┊   ┊ 28┊  isGroup: boolean; /* Computed property */
+┊   ┊ 29┊}
+┊   ┊ 30┊
+┊   ┊ 31┊export interface Message {
+┊   ┊ 32┊  id: string; 
+┊   ┊ 33┊  senderId: string; 
+┊   ┊ 34┊  sender: User; 
+┊   ┊ 35┊  content: string; 
+┊   ┊ 36┊  createdAt?: number | null; 
+┊   ┊ 37┊  type: number; /* FIXME: should return MessageType */
+┊   ┊ 38┊  recipients: Recipient[]; /* Whoever received the message */
+┊   ┊ 39┊  holderIds: string[]; /* Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise */
+┊   ┊ 40┊  ownership: boolean; /* Computed property */
+┊   ┊ 41┊}
+┊   ┊ 42┊
+┊   ┊ 43┊export interface Recipient {
+┊   ┊ 44┊  id: string; /* The user id */
+┊   ┊ 45┊  receivedAt?: number | null; 
+┊   ┊ 46┊  readAt?: number | null; 
+┊   ┊ 47┊}
+┊   ┊ 48┊
+┊   ┊ 49┊export interface Mutation {
+┊   ┊ 50┊  addChat?: Chat | null; 
+┊   ┊ 51┊  addGroup?: Chat | null; 
+┊   ┊ 52┊  removeChat?: string | null; 
+┊   ┊ 53┊  addMessage?: Message | null; 
+┊   ┊ 54┊  removeMessages?: string[] | null; 
+┊   ┊ 55┊  addMembers?: string[] | null; 
+┊   ┊ 56┊  removeMembers?: string[] | null; 
+┊   ┊ 57┊  addAdmins?: string[] | null; 
+┊   ┊ 58┊  removeAdmins?: string[] | null; 
+┊   ┊ 59┊  setGroupName?: string | null; 
+┊   ┊ 60┊  setGroupPicture?: string | null; 
+┊   ┊ 61┊  markAsReceived?: boolean | null; 
+┊   ┊ 62┊  markAsRead?: boolean | null; 
+┊   ┊ 63┊}
+┊   ┊ 64┊export interface ChatQueryArgs {
+┊   ┊ 65┊  chatId: string; 
+┊   ┊ 66┊}
+┊   ┊ 67┊export interface AddChatMutationArgs {
+┊   ┊ 68┊  recipientId: string; 
+┊   ┊ 69┊}
+┊   ┊ 70┊export interface AddGroupMutationArgs {
+┊   ┊ 71┊  recipientIds: string[]; 
+┊   ┊ 72┊  groupName: string; 
+┊   ┊ 73┊}
+┊   ┊ 74┊export interface RemoveChatMutationArgs {
+┊   ┊ 75┊  chatId: string; 
+┊   ┊ 76┊}
+┊   ┊ 77┊export interface AddMessageMutationArgs {
+┊   ┊ 78┊  chatId: string; 
+┊   ┊ 79┊  content: string; 
+┊   ┊ 80┊}
+┊   ┊ 81┊export interface RemoveMessagesMutationArgs {
+┊   ┊ 82┊  chatId: string; 
+┊   ┊ 83┊  messageIds?: string[] | null; 
+┊   ┊ 84┊  all?: boolean | null; 
+┊   ┊ 85┊}
+┊   ┊ 86┊export interface AddMembersMutationArgs {
+┊   ┊ 87┊  groupId: string; 
+┊   ┊ 88┊  userIds: string[]; 
+┊   ┊ 89┊}
+┊   ┊ 90┊export interface RemoveMembersMutationArgs {
+┊   ┊ 91┊  groupId: string; 
+┊   ┊ 92┊  userIds: string[]; 
+┊   ┊ 93┊}
+┊   ┊ 94┊export interface AddAdminsMutationArgs {
+┊   ┊ 95┊  groupId: string; 
+┊   ┊ 96┊  userIds: string[]; 
+┊   ┊ 97┊}
+┊   ┊ 98┊export interface RemoveAdminsMutationArgs {
+┊   ┊ 99┊  groupId: string; 
+┊   ┊100┊  userIds: string[]; 
+┊   ┊101┊}
+┊   ┊102┊export interface SetGroupNameMutationArgs {
+┊   ┊103┊  groupId: string; 
+┊   ┊104┊}
+┊   ┊105┊export interface SetGroupPictureMutationArgs {
+┊   ┊106┊  groupId: string; 
+┊   ┊107┊}
+┊   ┊108┊export interface MarkAsReceivedMutationArgs {
+┊   ┊109┊  chatId: string; 
+┊   ┊110┊}
+┊   ┊111┊export interface MarkAsReadMutationArgs {
+┊   ┊112┊  chatId: string; 
+┊   ┊113┊}
+┊   ┊114┊
+┊   ┊115┊export type MessageType = "TEXT" | "LOCATION" | "PICTURE";
+┊   ┊116┊
+┊   ┊117┊export namespace GetChats {
+┊   ┊118┊  export type Variables = {
+┊   ┊119┊  }
+┊   ┊120┊
+┊   ┊121┊  export type Query = {
+┊   ┊122┊    chats: Chats[]; 
+┊   ┊123┊  } 
+┊   ┊124┊
+┊   ┊125┊  export type Chats = {
+┊   ┊126┊    id: string; 
+┊   ┊127┊    name?: string | null; 
+┊   ┊128┊    picture?: string | null; 
+┊   ┊129┊    userIds: string[]; 
+┊   ┊130┊    unreadMessages: number; 
+┊   ┊131┊    lastMessage?: LastMessage | null; 
+┊   ┊132┊    isGroup: boolean; 
+┊   ┊133┊  } 
+┊   ┊134┊
+┊   ┊135┊  export type LastMessage = {
+┊   ┊136┊    id: string; 
+┊   ┊137┊    senderId: string; 
+┊   ┊138┊    sender: Sender; 
+┊   ┊139┊    content: string; 
+┊   ┊140┊    createdAt?: number | null; 
+┊   ┊141┊    type: number; 
+┊   ┊142┊    recipients: Recipients[]; 
+┊   ┊143┊    ownership: boolean; 
+┊   ┊144┊  } 
+┊   ┊145┊
+┊   ┊146┊  export type Sender = {
+┊   ┊147┊    id: string; 
+┊   ┊148┊    name?: string | null; 
+┊   ┊149┊  } 
+┊   ┊150┊
+┊   ┊151┊  export type Recipients = {
+┊   ┊152┊    id: string; 
+┊   ┊153┊    receivedAt?: number | null; 
+┊   ┊154┊    readAt?: number | null; 
+┊   ┊155┊  } 
+┊   ┊156┊}
```

[}]: #

Let's use them:

[{]: <helper> (diffStep "2.3")

#### Step 2.3: Use the generated types

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import {Component, Input} from '@angular/core';
+┊ ┊2┊import {GetChats} from '../../../../types';
 ┊2┊3┊
 ┊3┊4┊@Component({
 ┊4┊5┊  selector: 'app-chat-item',
```
```diff
@@ -16,5 +17,5 @@
 ┊16┊17┊export class ChatItemComponent {
 ┊17┊18┊  // tslint:disable-next-line:no-input-rename
 ┊18┊19┊  @Input('item')
-┊19┊  ┊  chat: any;
+┊  ┊20┊  chat: GetChats.Chats;
 ┊20┊21┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chats-list&#x2F;chats-list.component.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import {Component, Input} from '@angular/core';
+┊ ┊2┊import {GetChats} from '../../../../types';
 ┊2┊3┊
 ┊3┊4┊@Component({
 ┊4┊5┊  selector: 'app-chats-list',
```
```diff
@@ -14,7 +15,7 @@
 ┊14┊15┊export class ChatsListComponent {
 ┊15┊16┊  // tslint:disable-next-line:no-input-rename
 ┊16┊17┊  @Input('items')
-┊17┊  ┊  chats: any[];
+┊  ┊18┊  chats: GetChats.Chats[];
 ┊18┊19┊
 ┊19┊20┊  constructor() {}
 ┊20┊21┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.ts
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import {Component, OnInit} from '@angular/core';
 ┊2┊2┊import {ChatsService} from '../../../services/chats.service';
 ┊3┊3┊import {Observable} from 'rxjs/Observable';
+┊ ┊4┊import {GetChats} from '../../../../types';
 ┊4┊5┊
 ┊5┊6┊@Component({
 ┊6┊7┊  template: `
```
```diff
@@ -35,7 +36,7 @@
 ┊35┊36┊  styleUrls: ['./chats.component.scss'],
 ┊36┊37┊})
 ┊37┊38┊export class ChatsComponent implements OnInit {
-┊38┊  ┊  chats$: Observable<any[]>;
+┊  ┊39┊  chats$: Observable<GetChats.Chats[]>;
 ┊39┊40┊
 ┊40┊41┊  constructor(private chatsService: ChatsService) {
 ┊41┊42┊  }
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import {Apollo} from 'apollo-angular';
 ┊4┊4┊import {Injectable} from '@angular/core';
 ┊5┊5┊import {getChatsQuery} from '../../graphql/getChats.query';
+┊ ┊6┊import {GetChats} from '../../types';
 ┊6┊7┊
 ┊7┊8┊@Injectable()
 ┊8┊9┊export class ChatsService {
```
```diff
@@ -10,11 +11,11 @@
 ┊10┊11┊  constructor(private apollo: Apollo) {}
 ┊11┊12┊
 ┊12┊13┊  getChats() {
-┊13┊  ┊    const query = this.apollo.watchQuery<any>({
+┊  ┊14┊    const query = this.apollo.watchQuery<GetChats.Query>({
 ┊14┊15┊      query: getChatsQuery
 ┊15┊16┊    });
 ┊16┊17┊    const chats$ = query.valueChanges.pipe(
-┊17┊  ┊      map((result: ApolloQueryResult<any>) => result.data.chats)
+┊  ┊18┊      map((result: ApolloQueryResult<GetChats.Query>) => result.data.chats)
 ┊18┊19┊    );
 ┊19┊20┊
 ┊20┊21┊    return {query, chats$};
```

[}]: #

# Chapter 7

[{]: <helper> (diffStep "3.1")

#### Step 3.1: Testing

##### Deleted src&#x2F;app&#x2F;app.component.spec.ts
```diff
@@ -1,27 +0,0 @@
-┊ 1┊  ┊import { TestBed, async } from '@angular/core/testing';
-┊ 2┊  ┊import { AppComponent } from './app.component';
-┊ 3┊  ┊describe('AppComponent', () => {
-┊ 4┊  ┊  beforeEach(async(() => {
-┊ 5┊  ┊    TestBed.configureTestingModule({
-┊ 6┊  ┊      declarations: [
-┊ 7┊  ┊        AppComponent
-┊ 8┊  ┊      ],
-┊ 9┊  ┊    }).compileComponents();
-┊10┊  ┊  }));
-┊11┊  ┊  it('should create the app', async(() => {
-┊12┊  ┊    const fixture = TestBed.createComponent(AppComponent);
-┊13┊  ┊    const app = fixture.debugElement.componentInstance;
-┊14┊  ┊    expect(app).toBeTruthy();
-┊15┊  ┊  }));
-┊16┊  ┊  it(`should have as title 'app'`, async(() => {
-┊17┊  ┊    const fixture = TestBed.createComponent(AppComponent);
-┊18┊  ┊    const app = fixture.debugElement.componentInstance;
-┊19┊  ┊    expect(app.title).toEqual('app');
-┊20┊  ┊  }));
-┊21┊  ┊  it('should render title in a h1 tag', async(() => {
-┊22┊  ┊    const fixture = TestBed.createComponent(AppComponent);
-┊23┊  ┊    fixture.detectChanges();
-┊24┊  ┊    const compiled = fixture.debugElement.nativeElement;
-┊25┊  ┊    expect(compiled.querySelector('h1').textContent).toContain('Welcome to app!');
-┊26┊  ┊  }));
-┊27┊  ┊});
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.spec.ts
```diff
@@ -0,0 +1,71 @@
+┊  ┊ 1┊import { async, ComponentFixture, TestBed } from '@angular/core/testing';
+┊  ┊ 2┊
+┊  ┊ 3┊import { ChatItemComponent } from './chat-item.component';
+┊  ┊ 4┊import {GetChats} from '../../../../types';
+┊  ┊ 5┊import {DebugElement} from '@angular/core';
+┊  ┊ 6┊import {By} from '@angular/platform-browser';
+┊  ┊ 7┊import {TruncateModule} from 'ng2-truncate';
+┊  ┊ 8┊
+┊  ┊ 9┊describe('ChatItemComponent', () => {
+┊  ┊10┊  let component: ChatItemComponent;
+┊  ┊11┊  let fixture: ComponentFixture<ChatItemComponent>;
+┊  ┊12┊  let el: DebugElement;
+┊  ┊13┊
+┊  ┊14┊  const chat: GetChats.Chats = {
+┊  ┊15┊    id: '1',
+┊  ┊16┊    name: 'Niccolo\' Belli',
+┊  ┊17┊    picture: null,
+┊  ┊18┊    userIds: ['1', '2'],
+┊  ┊19┊    unreadMessages: 0,
+┊  ┊20┊    lastMessage: {
+┊  ┊21┊      id: '1234567890',
+┊  ┊22┊      senderId: '1',
+┊  ┊23┊      sender: {
+┊  ┊24┊        id: '1',
+┊  ┊25┊        name: 'Niccolo\' Belli',
+┊  ┊26┊      },
+┊  ┊27┊      content: 'Hello! How are you? A lot happened since last time',
+┊  ┊28┊      createdAt: 1513435525,
+┊  ┊29┊      type: 0,
+┊  ┊30┊      recipients: [{
+┊  ┊31┊        id: '2',
+┊  ┊32┊        receivedAt: null,
+┊  ┊33┊        readAt: null
+┊  ┊34┊      }],
+┊  ┊35┊      ownership: true
+┊  ┊36┊    },
+┊  ┊37┊    isGroup: false
+┊  ┊38┊  };
+┊  ┊39┊
+┊  ┊40┊  beforeEach(async(() => {
+┊  ┊41┊    TestBed.configureTestingModule({
+┊  ┊42┊      declarations: [ ChatItemComponent ],
+┊  ┊43┊      imports: [TruncateModule]
+┊  ┊44┊    })
+┊  ┊45┊    .compileComponents();
+┊  ┊46┊  }));
+┊  ┊47┊
+┊  ┊48┊  beforeEach(() => {
+┊  ┊49┊    fixture = TestBed.createComponent(ChatItemComponent);
+┊  ┊50┊    component = fixture.componentInstance;
+┊  ┊51┊    component.chat = chat;
+┊  ┊52┊    fixture.detectChanges();
+┊  ┊53┊    el = fixture.debugElement;
+┊  ┊54┊  });
+┊  ┊55┊
+┊  ┊56┊  it('should create', () => {
+┊  ┊57┊    expect(component).toBeTruthy();
+┊  ┊58┊  });
+┊  ┊59┊
+┊  ┊60┊  it('should contain the chat name', () => {
+┊  ┊61┊    expect(el.query(By.css('.chat-recipient > div:first-child')).nativeElement.textContent).toContain(chat.name);
+┊  ┊62┊  });
+┊  ┊63┊
+┊  ┊64┊  it('should contain the first couple of characters of the message content', () => {
+┊  ┊65┊    expect(el.query(By.css('.chat-content')).nativeElement.textContent).toContain(chat.lastMessage.content.slice(0, 20));
+┊  ┊66┊  });
+┊  ┊67┊
+┊  ┊68┊  it('should not contain the latest characters of the message content', () => {
+┊  ┊69┊    expect(el.query(By.css('.chat-content')).nativeElement.textContent).not.toContain(chat.lastMessage.content.slice(20));
+┊  ┊70┊  });
+┊  ┊71┊});
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.spec.ts
```diff
@@ -0,0 +1,251 @@
+┊   ┊  1┊import { async, ComponentFixture, TestBed } from '@angular/core/testing';
+┊   ┊  2┊
+┊   ┊  3┊import { ChatsComponent } from './chats.component';
+┊   ┊  4┊import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
+┊   ┊  5┊import {ChatsListComponent} from '../../components/chats-list/chats-list.component';
+┊   ┊  6┊import {ChatItemComponent} from '../../components/chat-item/chat-item.component';
+┊   ┊  7┊import {TruncateModule} from 'ng2-truncate';
+┊   ┊  8┊import {SharedModule} from '../../../shared/shared.module';
+┊   ┊  9┊import {FormsModule} from '@angular/forms';
+┊   ┊ 10┊import {MatButtonModule, MatIconModule, MatListModule, MatMenuModule} from '@angular/material';
+┊   ┊ 11┊import {ChatsService} from '../../../services/chats.service';
+┊   ┊ 12┊import {Apollo} from 'apollo-angular';
+┊   ┊ 13┊import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
+┊   ┊ 14┊import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
+┊   ┊ 15┊import {InMemoryCache} from 'apollo-cache-inmemory';
+┊   ┊ 16┊import {BrowserModule, By} from '@angular/platform-browser';
+┊   ┊ 17┊import {RouterTestingModule} from '@angular/router/testing';
+┊   ┊ 18┊
+┊   ┊ 19┊describe('ChatsComponent', () => {
+┊   ┊ 20┊  let component: ChatsComponent;
+┊   ┊ 21┊  let fixture: ComponentFixture<ChatsComponent>;
+┊   ┊ 22┊  let el: DebugElement;
+┊   ┊ 23┊
+┊   ┊ 24┊  let httpMock: HttpTestingController;
+┊   ┊ 25┊  let httpLink: HttpLink;
+┊   ┊ 26┊  let apollo: Apollo;
+┊   ┊ 27┊
+┊   ┊ 28┊  const chats = [
+┊   ┊ 29┊    {
+┊   ┊ 30┊      id: '1',
+┊   ┊ 31┊      __typename: 'Chat',
+┊   ┊ 32┊      name: 'Avery Stewart',
+┊   ┊ 33┊      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
+┊   ┊ 34┊      userIds: [
+┊   ┊ 35┊        '1',
+┊   ┊ 36┊        '3'
+┊   ┊ 37┊      ],
+┊   ┊ 38┊      unreadMessages: 1,
+┊   ┊ 39┊      lastMessage: {
+┊   ┊ 40┊        id: '708323562255',
+┊   ┊ 41┊        __typename: 'Message',
+┊   ┊ 42┊        senderId: '3',
+┊   ┊ 43┊        sender: {
+┊   ┊ 44┊          id: '3',
+┊   ┊ 45┊          __typename: 'User',
+┊   ┊ 46┊          name: 'Avery Stewart'
+┊   ┊ 47┊        },
+┊   ┊ 48┊        content: 'Yep!',
+┊   ┊ 49┊        createdAt: 1514035700,
+┊   ┊ 50┊        type: 0,
+┊   ┊ 51┊        recipients: [
+┊   ┊ 52┊          {
+┊   ┊ 53┊            id: '1',
+┊   ┊ 54┊            __typename: 'Recipient',
+┊   ┊ 55┊            receivedAt: null,
+┊   ┊ 56┊            readAt: null
+┊   ┊ 57┊          }
+┊   ┊ 58┊        ],
+┊   ┊ 59┊        ownership: false
+┊   ┊ 60┊      },
+┊   ┊ 61┊      isGroup: false
+┊   ┊ 62┊    },
+┊   ┊ 63┊    {
+┊   ┊ 64┊      id: '2',
+┊   ┊ 65┊      __typename: 'Chat',
+┊   ┊ 66┊      name: 'Katie Peterson',
+┊   ┊ 67┊      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
+┊   ┊ 68┊      userIds: [
+┊   ┊ 69┊        '1',
+┊   ┊ 70┊        '4'
+┊   ┊ 71┊      ],
+┊   ┊ 72┊      unreadMessages: 0,
+┊   ┊ 73┊      lastMessage: {
+┊   ┊ 74┊        id: '559578737535',
+┊   ┊ 75┊        __typename: 'Message',
+┊   ┊ 76┊        senderId: '1',
+┊   ┊ 77┊        sender: {
+┊   ┊ 78┊          id: '1',
+┊   ┊ 79┊          __typename: 'User',
+┊   ┊ 80┊          name: 'Ethan Gonzalez'
+┊   ┊ 81┊        },
+┊   ┊ 82┊        content: 'Hey, it\'s me',
+┊   ┊ 83┊        createdAt: 1514031800,
+┊   ┊ 84┊        type: 0,
+┊   ┊ 85┊        recipients: [
+┊   ┊ 86┊          {
+┊   ┊ 87┊            id: '4',
+┊   ┊ 88┊            __typename: 'Recipient',
+┊   ┊ 89┊            receivedAt: null,
+┊   ┊ 90┊            readAt: null
+┊   ┊ 91┊          }
+┊   ┊ 92┊        ],
+┊   ┊ 93┊        ownership: true
+┊   ┊ 94┊      },
+┊   ┊ 95┊      isGroup: false
+┊   ┊ 96┊    },
+┊   ┊ 97┊    {
+┊   ┊ 98┊      id: '3',
+┊   ┊ 99┊      __typename: 'Chat',
+┊   ┊100┊      name: 'Ray Edwards',
+┊   ┊101┊      picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
+┊   ┊102┊      userIds: [
+┊   ┊103┊        '1',
+┊   ┊104┊        '5'
+┊   ┊105┊      ],
+┊   ┊106┊      unreadMessages: 0,
+┊   ┊107┊      lastMessage: {
+┊   ┊108┊        id: '127559683621',
+┊   ┊109┊        __typename: 'Message',
+┊   ┊110┊        senderId: '1',
+┊   ┊111┊        sender: {
+┊   ┊112┊          id: '1',
+┊   ┊113┊          __typename: 'User',
+┊   ┊114┊          name: 'Ethan Gonzalez'
+┊   ┊115┊        },
+┊   ┊116┊        content: 'You still there?',
+┊   ┊117┊        createdAt: 1514010200,
+┊   ┊118┊        type: 0,
+┊   ┊119┊        recipients: [
+┊   ┊120┊          {
+┊   ┊121┊            id: '5',
+┊   ┊122┊            __typename: 'Recipient',
+┊   ┊123┊            receivedAt: null,
+┊   ┊124┊            readAt: null
+┊   ┊125┊          }
+┊   ┊126┊        ],
+┊   ┊127┊        ownership: true
+┊   ┊128┊      },
+┊   ┊129┊      isGroup: false
+┊   ┊130┊    },
+┊   ┊131┊    {
+┊   ┊132┊      id: '6',
+┊   ┊133┊      __typename: 'Chat',
+┊   ┊134┊      name: 'Niccolò Belli',
+┊   ┊135┊      picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
+┊   ┊136┊      userIds: [
+┊   ┊137┊        '1',
+┊   ┊138┊        '6'
+┊   ┊139┊      ],
+┊   ┊140┊      unreadMessages: 0,
+┊   ┊141┊      lastMessage: null,
+┊   ┊142┊      isGroup: false
+┊   ┊143┊    },
+┊   ┊144┊    {
+┊   ┊145┊      id: '8',
+┊   ┊146┊      __typename: 'Chat',
+┊   ┊147┊      name: 'A user 0 group',
+┊   ┊148┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊   ┊149┊      userIds: [
+┊   ┊150┊        '1',
+┊   ┊151┊        '3',
+┊   ┊152┊        '4',
+┊   ┊153┊        '6'
+┊   ┊154┊      ],
+┊   ┊155┊      unreadMessages: 1,
+┊   ┊156┊      lastMessage: {
+┊   ┊157┊        id: '147283729633',
+┊   ┊158┊        __typename: 'Message',
+┊   ┊159┊        senderId: '4',
+┊   ┊160┊        sender: {
+┊   ┊161┊          id: '4',
+┊   ┊162┊          __typename: 'User',
+┊   ┊163┊          name: 'Katie Peterson'
+┊   ┊164┊        },
+┊   ┊165┊        content: 'Awesome!',
+┊   ┊166┊        createdAt: 1512830000,
+┊   ┊167┊        type: 0,
+┊   ┊168┊        recipients: [
+┊   ┊169┊          {
+┊   ┊170┊            id: '1',
+┊   ┊171┊            __typename: 'Recipient',
+┊   ┊172┊            receivedAt: null,
+┊   ┊173┊            readAt: null
+┊   ┊174┊          },
+┊   ┊175┊          {
+┊   ┊176┊            id: '6',
+┊   ┊177┊            __typename: 'Recipient',
+┊   ┊178┊            receivedAt: null,
+┊   ┊179┊            readAt: null
+┊   ┊180┊          }
+┊   ┊181┊        ],
+┊   ┊182┊        ownership: false
+┊   ┊183┊      },
+┊   ┊184┊      isGroup: true
+┊   ┊185┊    }
+┊   ┊186┊  ];
+┊   ┊187┊
+┊   ┊188┊  beforeEach(async(() => {
+┊   ┊189┊    TestBed.configureTestingModule({
+┊   ┊190┊      declarations: [
+┊   ┊191┊        ChatsComponent,
+┊   ┊192┊        ChatsListComponent,
+┊   ┊193┊        ChatItemComponent
+┊   ┊194┊      ],
+┊   ┊195┊      imports: [
+┊   ┊196┊        MatMenuModule,
+┊   ┊197┊        MatIconModule,
+┊   ┊198┊        MatButtonModule,
+┊   ┊199┊        MatListModule,
+┊   ┊200┊        TruncateModule,
+┊   ┊201┊        HttpLinkModule,
+┊   ┊202┊        HttpClientTestingModule,
+┊   ┊203┊        RouterTestingModule
+┊   ┊204┊      ],
+┊   ┊205┊      providers: [
+┊   ┊206┊        ChatsService,
+┊   ┊207┊        Apollo,
+┊   ┊208┊      ],
+┊   ┊209┊      schemas: [NO_ERRORS_SCHEMA]
+┊   ┊210┊    })
+┊   ┊211┊      .compileComponents();
+┊   ┊212┊
+┊   ┊213┊    httpMock = TestBed.get(HttpTestingController);
+┊   ┊214┊    httpLink = TestBed.get(HttpLink);
+┊   ┊215┊    apollo = TestBed.get(Apollo);
+┊   ┊216┊
+┊   ┊217┊    apollo.create({
+┊   ┊218┊      link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
+┊   ┊219┊      cache: new InMemoryCache()
+┊   ┊220┊    });
+┊   ┊221┊  }));
+┊   ┊222┊
+┊   ┊223┊  beforeEach(() => {
+┊   ┊224┊    fixture = TestBed.createComponent(ChatsComponent);
+┊   ┊225┊    component = fixture.componentInstance;
+┊   ┊226┊    fixture.detectChanges();
+┊   ┊227┊    const req = httpMock.expectOne('http://localhost:3000/graphql', 'call to api');
+┊   ┊228┊    req.flush({
+┊   ┊229┊      data: {
+┊   ┊230┊        chats
+┊   ┊231┊      }
+┊   ┊232┊    });
+┊   ┊233┊  });
+┊   ┊234┊
+┊   ┊235┊  it('should create', () => {
+┊   ┊236┊    expect(component).toBeTruthy();
+┊   ┊237┊  });
+┊   ┊238┊
+┊   ┊239┊  it('should display the chats', () => {
+┊   ┊240┊    fixture.whenStable().then(() => {
+┊   ┊241┊      fixture.detectChanges();
+┊   ┊242┊      el = fixture.debugElement;
+┊   ┊243┊      for (let i = 0; i < chats.length; i++) {
+┊   ┊244┊        expect(el.query(By.css(`app-chats-list > mat-list > mat-list-item:nth-child(${i + 1}) > div > app-chat-item > div > div > div`))
+┊   ┊245┊          .nativeElement.textContent).toContain(chats[i].name);
+┊   ┊246┊      }
+┊   ┊247┊    });
+┊   ┊248┊
+┊   ┊249┊    httpMock.verify();
+┊   ┊250┊  });
+┊   ┊251┊});
```

##### Added src&#x2F;app&#x2F;services&#x2F;chats.service.spec.ts
```diff
@@ -0,0 +1,217 @@
+┊   ┊  1┊import { TestBed, inject } from '@angular/core/testing';
+┊   ┊  2┊
+┊   ┊  3┊import { ChatsService } from './chats.service';
+┊   ┊  4┊import {Apollo} from 'apollo-angular';
+┊   ┊  5┊import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
+┊   ┊  6┊import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
+┊   ┊  7┊import {InMemoryCache} from 'apollo-cache-inmemory';
+┊   ┊  8┊
+┊   ┊  9┊describe('ChatsService', () => {
+┊   ┊ 10┊  let httpMock: HttpTestingController;
+┊   ┊ 11┊  let httpLink: HttpLink;
+┊   ┊ 12┊  let apollo: Apollo;
+┊   ┊ 13┊  const chats = [
+┊   ┊ 14┊    {
+┊   ┊ 15┊      id: '1',
+┊   ┊ 16┊      __typename: 'Chat',
+┊   ┊ 17┊      name: 'Avery Stewart',
+┊   ┊ 18┊      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
+┊   ┊ 19┊      userIds: [
+┊   ┊ 20┊        '1',
+┊   ┊ 21┊        '3'
+┊   ┊ 22┊      ],
+┊   ┊ 23┊      unreadMessages: 1,
+┊   ┊ 24┊      lastMessage: {
+┊   ┊ 25┊        id: '708323562255',
+┊   ┊ 26┊        __typename: 'Message',
+┊   ┊ 27┊        senderId: '3',
+┊   ┊ 28┊        sender: {
+┊   ┊ 29┊          id: '3',
+┊   ┊ 30┊          __typename: 'User',
+┊   ┊ 31┊          name: 'Avery Stewart'
+┊   ┊ 32┊        },
+┊   ┊ 33┊        content: 'Yep!',
+┊   ┊ 34┊        createdAt: 1514035700,
+┊   ┊ 35┊        type: 0,
+┊   ┊ 36┊        recipients: [
+┊   ┊ 37┊          {
+┊   ┊ 38┊            id: '1',
+┊   ┊ 39┊            __typename: 'Recipient',
+┊   ┊ 40┊            receivedAt: null,
+┊   ┊ 41┊            readAt: null
+┊   ┊ 42┊          }
+┊   ┊ 43┊        ],
+┊   ┊ 44┊        ownership: false
+┊   ┊ 45┊      },
+┊   ┊ 46┊      isGroup: false
+┊   ┊ 47┊    },
+┊   ┊ 48┊    {
+┊   ┊ 49┊      id: '2',
+┊   ┊ 50┊      __typename: 'Chat',
+┊   ┊ 51┊      name: 'Katie Peterson',
+┊   ┊ 52┊      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
+┊   ┊ 53┊      userIds: [
+┊   ┊ 54┊        '1',
+┊   ┊ 55┊        '4'
+┊   ┊ 56┊      ],
+┊   ┊ 57┊      unreadMessages: 0,
+┊   ┊ 58┊      lastMessage: {
+┊   ┊ 59┊        id: '559578737535',
+┊   ┊ 60┊        __typename: 'Message',
+┊   ┊ 61┊        senderId: '1',
+┊   ┊ 62┊        sender: {
+┊   ┊ 63┊          id: '1',
+┊   ┊ 64┊          __typename: 'User',
+┊   ┊ 65┊          name: 'Ethan Gonzalez'
+┊   ┊ 66┊        },
+┊   ┊ 67┊        content: 'Hey, it\'s me',
+┊   ┊ 68┊        createdAt: 1514031800,
+┊   ┊ 69┊        type: 0,
+┊   ┊ 70┊        recipients: [
+┊   ┊ 71┊          {
+┊   ┊ 72┊            id: '4',
+┊   ┊ 73┊            __typename: 'Recipient',
+┊   ┊ 74┊            receivedAt: null,
+┊   ┊ 75┊            readAt: null
+┊   ┊ 76┊          }
+┊   ┊ 77┊        ],
+┊   ┊ 78┊        ownership: true
+┊   ┊ 79┊      },
+┊   ┊ 80┊      isGroup: false
+┊   ┊ 81┊    },
+┊   ┊ 82┊    {
+┊   ┊ 83┊      id: '3',
+┊   ┊ 84┊      __typename: 'Chat',
+┊   ┊ 85┊      name: 'Ray Edwards',
+┊   ┊ 86┊      picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
+┊   ┊ 87┊      userIds: [
+┊   ┊ 88┊        '1',
+┊   ┊ 89┊        '5'
+┊   ┊ 90┊      ],
+┊   ┊ 91┊      unreadMessages: 0,
+┊   ┊ 92┊      lastMessage: {
+┊   ┊ 93┊        id: '127559683621',
+┊   ┊ 94┊        __typename: 'Message',
+┊   ┊ 95┊        senderId: '1',
+┊   ┊ 96┊        sender: {
+┊   ┊ 97┊          id: '1',
+┊   ┊ 98┊          __typename: 'User',
+┊   ┊ 99┊          name: 'Ethan Gonzalez'
+┊   ┊100┊        },
+┊   ┊101┊        content: 'You still there?',
+┊   ┊102┊        createdAt: 1514010200,
+┊   ┊103┊        type: 0,
+┊   ┊104┊        recipients: [
+┊   ┊105┊          {
+┊   ┊106┊            id: '5',
+┊   ┊107┊            __typename: 'Recipient',
+┊   ┊108┊            receivedAt: null,
+┊   ┊109┊            readAt: null
+┊   ┊110┊          }
+┊   ┊111┊        ],
+┊   ┊112┊        ownership: true
+┊   ┊113┊      },
+┊   ┊114┊      isGroup: false
+┊   ┊115┊    },
+┊   ┊116┊    {
+┊   ┊117┊      id: '6',
+┊   ┊118┊      __typename: 'Chat',
+┊   ┊119┊      name: 'Niccolò Belli',
+┊   ┊120┊      picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
+┊   ┊121┊      userIds: [
+┊   ┊122┊        '1',
+┊   ┊123┊        '6'
+┊   ┊124┊      ],
+┊   ┊125┊      unreadMessages: 0,
+┊   ┊126┊      lastMessage: null,
+┊   ┊127┊      isGroup: false
+┊   ┊128┊    },
+┊   ┊129┊    {
+┊   ┊130┊      id: '8',
+┊   ┊131┊      __typename: 'Chat',
+┊   ┊132┊      name: 'A user 0 group',
+┊   ┊133┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊   ┊134┊      userIds: [
+┊   ┊135┊        '1',
+┊   ┊136┊        '3',
+┊   ┊137┊        '4',
+┊   ┊138┊        '6'
+┊   ┊139┊      ],
+┊   ┊140┊      unreadMessages: 1,
+┊   ┊141┊      lastMessage: {
+┊   ┊142┊        id: '147283729633',
+┊   ┊143┊        __typename: 'Message',
+┊   ┊144┊        senderId: '4',
+┊   ┊145┊        sender: {
+┊   ┊146┊          id: '4',
+┊   ┊147┊          __typename: 'User',
+┊   ┊148┊          name: 'Katie Peterson'
+┊   ┊149┊        },
+┊   ┊150┊        content: 'Awesome!',
+┊   ┊151┊        createdAt: 1512830000,
+┊   ┊152┊        type: 0,
+┊   ┊153┊        recipients: [
+┊   ┊154┊          {
+┊   ┊155┊            id: '1',
+┊   ┊156┊            __typename: 'Recipient',
+┊   ┊157┊            receivedAt: null,
+┊   ┊158┊            readAt: null
+┊   ┊159┊          },
+┊   ┊160┊          {
+┊   ┊161┊            id: '6',
+┊   ┊162┊            __typename: 'Recipient',
+┊   ┊163┊            receivedAt: null,
+┊   ┊164┊            readAt: null
+┊   ┊165┊          }
+┊   ┊166┊        ],
+┊   ┊167┊        ownership: false
+┊   ┊168┊      },
+┊   ┊169┊      isGroup: true
+┊   ┊170┊    }
+┊   ┊171┊  ];
+┊   ┊172┊
+┊   ┊173┊  beforeEach(() => {
+┊   ┊174┊    TestBed.configureTestingModule({
+┊   ┊175┊      imports: [
+┊   ┊176┊        HttpLinkModule,
+┊   ┊177┊        // HttpClientModule,
+┊   ┊178┊        HttpClientTestingModule,
+┊   ┊179┊      ],
+┊   ┊180┊      providers: [
+┊   ┊181┊        ChatsService,
+┊   ┊182┊        Apollo,
+┊   ┊183┊      ]
+┊   ┊184┊    });
+┊   ┊185┊
+┊   ┊186┊    httpMock = TestBed.get(HttpTestingController);
+┊   ┊187┊    httpLink = TestBed.get(HttpLink);
+┊   ┊188┊    apollo = TestBed.get(Apollo);
+┊   ┊189┊
+┊   ┊190┊    apollo.create({
+┊   ┊191┊      link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
+┊   ┊192┊      cache: new InMemoryCache()
+┊   ┊193┊    });
+┊   ┊194┊  });
+┊   ┊195┊
+┊   ┊196┊  it('should be created', inject([ChatsService], (service: ChatsService) => {
+┊   ┊197┊    expect(service).toBeTruthy();
+┊   ┊198┊  }));
+┊   ┊199┊
+┊   ┊200┊  it('should get chats', inject([ChatsService], (service: ChatsService) => {
+┊   ┊201┊    service.getChats().chats$.subscribe(_chats => {
+┊   ┊202┊      expect(_chats.length).toEqual(chats.length);
+┊   ┊203┊      for (let i = 0; i < _chats.length; i++) {
+┊   ┊204┊        expect(_chats[i]).toEqual(chats[i]);
+┊   ┊205┊      }
+┊   ┊206┊    });
+┊   ┊207┊
+┊   ┊208┊    const req = httpMock.expectOne('http://localhost:3000/graphql', 'call to api');
+┊   ┊209┊    expect(req.request.method).toBe('POST');
+┊   ┊210┊    req.flush({
+┊   ┊211┊      data: {
+┊   ┊212┊        chats
+┊   ┊213┊      }
+┊   ┊214┊    });
+┊   ┊215┊    httpMock.verify();
+┊   ┊216┊  }));
+┊   ┊217┊});
```

[}]: #

# Chapter 8

We created a module which lists all of our chats, but we still need to show a particular chat.
Let's create the `chat-viewer` module! We're going to create a container component called `ChatComponent` and a couple of presentational components.

[{]: <helper> (diffStep "4.1")

#### Step 4.1: Chat Viewer

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊import {InMemoryCache} from 'apollo-cache-inmemory';
 ┊10┊10┊import {ChatsListerModule} from './chats-lister/chats-lister.module';
 ┊11┊11┊import {RouterModule, Routes} from '@angular/router';
+┊  ┊12┊import {ChatViewerModule} from './chat-viewer/chat-viewer.module';
 ┊12┊13┊
 ┊13┊14┊const routes: Routes = [
 ┊14┊15┊  {path: '', redirectTo: 'chats', pathMatch: 'full'},
```
```diff
@@ -28,6 +29,7 @@
 ┊28┊29┊    RouterModule.forRoot(routes),
 ┊29┊30┊    // Feature modules
 ┊30┊31┊    ChatsListerModule,
+┊  ┊32┊    ChatViewerModule,
 ┊31┊33┊  ],
 ┊32┊34┊  providers: [],
 ┊33┊35┊  bootstrap: [AppComponent]
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;chat-viewer.module.ts
```diff
@@ -0,0 +1,53 @@
+┊  ┊ 1┊import { BrowserModule } from '@angular/platform-browser';
+┊  ┊ 2┊import { NgModule } from '@angular/core';
+┊  ┊ 3┊
+┊  ┊ 4┊import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
+┊  ┊ 5┊import {MatButtonModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';
+┊  ┊ 6┊import {RouterModule, Routes} from '@angular/router';
+┊  ┊ 7┊import {FormsModule} from '@angular/forms';
+┊  ┊ 8┊import {ChatsService} from '../services/chats.service';
+┊  ┊ 9┊import {ChatComponent} from './containers/chat/chat.component';
+┊  ┊10┊import {MessagesListComponent} from './components/messages-list/messages-list.component';
+┊  ┊11┊import {MessageItemComponent} from './components/message-item/message-item.component';
+┊  ┊12┊import {NewMessageComponent} from './components/new-message/new-message.component';
+┊  ┊13┊import {SharedModule} from '../shared/shared.module';
+┊  ┊14┊
+┊  ┊15┊const routes: Routes = [
+┊  ┊16┊  {
+┊  ┊17┊    path: 'chat', children: [
+┊  ┊18┊      {path: ':id', component: ChatComponent},
+┊  ┊19┊    ],
+┊  ┊20┊  },
+┊  ┊21┊];
+┊  ┊22┊
+┊  ┊23┊@NgModule({
+┊  ┊24┊  declarations: [
+┊  ┊25┊    ChatComponent,
+┊  ┊26┊    MessagesListComponent,
+┊  ┊27┊    MessageItemComponent,
+┊  ┊28┊    NewMessageComponent,
+┊  ┊29┊  ],
+┊  ┊30┊  imports: [
+┊  ┊31┊    BrowserModule,
+┊  ┊32┊    // Material
+┊  ┊33┊    MatToolbarModule,
+┊  ┊34┊    MatMenuModule,
+┊  ┊35┊    MatIconModule,
+┊  ┊36┊    MatButtonModule,
+┊  ┊37┊    MatListModule,
+┊  ┊38┊    MatGridListModule,
+┊  ┊39┊    // Animations
+┊  ┊40┊    BrowserAnimationsModule,
+┊  ┊41┊    // Routing
+┊  ┊42┊    RouterModule.forChild(routes),
+┊  ┊43┊    // Forms
+┊  ┊44┊    FormsModule,
+┊  ┊45┊    // Feature modules
+┊  ┊46┊    SharedModule,
+┊  ┊47┊  ],
+┊  ┊48┊  providers: [
+┊  ┊49┊    ChatsService,
+┊  ┊50┊  ],
+┊  ┊51┊})
+┊  ┊52┊export class ChatViewerModule {
+┊  ┊53┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;message-item&#x2F;message-item.component.scss
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: flex;
+┊  ┊ 3┊  width: 100%;
+┊  ┊ 4┊}
+┊  ┊ 5┊
+┊  ┊ 6┊.message {
+┊  ┊ 7┊  max-width: 75%;
+┊  ┊ 8┊  background-color: lightgoldenrodyellow;
+┊  ┊ 9┊
+┊  ┊10┊  &.mine {
+┊  ┊11┊    background-color: lightcyan;
+┊  ┊12┊    margin-left: auto;
+┊  ┊13┊  }
+┊  ┊14┊
+┊  ┊15┊  .message-sender {
+┊  ┊16┊    font-size: small;
+┊  ┊17┊  }
+┊  ┊18┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;message-item&#x2F;message-item.component.ts
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-message-item',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <div class="message"
+┊  ┊ 7┊         [ngClass]="{'mine': message.ownership}">
+┊  ┊ 8┊      <div *ngIf="isGroup && !message.ownership" class="message-sender">{{ message.sender.name }}</div>
+┊  ┊ 9┊      <div>{{ message.content }}</div>
+┊  ┊10┊    </div>
+┊  ┊11┊  `,
+┊  ┊12┊  styleUrls: ['message-item.component.scss'],
+┊  ┊13┊})
+┊  ┊14┊export class MessageItemComponent {
+┊  ┊15┊  // tslint:disable-next-line:no-input-rename
+┊  ┊16┊  @Input('item')
+┊  ┊17┊  message: any;
+┊  ┊18┊
+┊  ┊19┊  @Input()
+┊  ┊20┊  isGroup: boolean;
+┊  ┊21┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;messages-list&#x2F;messages-list.component.scss
```diff
@@ -0,0 +1,12 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: block;
+┊  ┊ 3┊  height: 100%;
+┊  ┊ 4┊  overflow-y: scroll;
+┊  ┊ 5┊  background-color: aliceblue;
+┊  ┊ 6┊}
+┊  ┊ 7┊
+┊  ┊ 8┊/*
+┊  ┊ 9┊:host::-webkit-scrollbar {
+┊  ┊10┊  display: none;
+┊  ┊11┊}
+┊  ┊12┊*/
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;messages-list&#x2F;messages-list.component.ts
```diff
@@ -0,0 +1,23 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-messages-list',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <mat-list>
+┊  ┊ 7┊      <mat-list-item *ngFor="let message of messages">
+┊  ┊ 8┊        <app-message-item [item]="message" [isGroup]="isGroup"></app-message-item>
+┊  ┊ 9┊      </mat-list-item>
+┊  ┊10┊    </mat-list>
+┊  ┊11┊  `,
+┊  ┊12┊  styleUrls: ['messages-list.component.scss'],
+┊  ┊13┊})
+┊  ┊14┊export class MessagesListComponent {
+┊  ┊15┊  // tslint:disable-next-line:no-input-rename
+┊  ┊16┊  @Input('items')
+┊  ┊17┊  messages: any[];
+┊  ┊18┊
+┊  ┊19┊  @Input()
+┊  ┊20┊  isGroup: boolean;
+┊  ┊21┊
+┊  ┊22┊  constructor() {}
+┊  ┊23┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;new-message&#x2F;new-message.component.scss
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: flex;
+┊  ┊ 3┊  height: 8vh;
+┊  ┊ 4┊}
+┊  ┊ 5┊
+┊  ┊ 6┊input {
+┊  ┊ 7┊  width: 100%;
+┊  ┊ 8┊}
+┊  ┊ 9┊
+┊  ┊10┊button {
+┊  ┊11┊  width: 8vh;
+┊  ┊12┊  min-width: 56px;
+┊  ┊13┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;new-message&#x2F;new-message.component.ts
```diff
@@ -0,0 +1,34 @@
+┊  ┊ 1┊import {Component, EventEmitter, Input, Output} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-new-message',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <input type="text" [(ngModel)]="message" (keyup)="onInputKeyup($event)"/>
+┊  ┊ 7┊    <button mat-button (click)="emitMessage()" [disabled]="disabled">
+┊  ┊ 8┊      <mat-icon aria-label="Icon-button with a send icon">send</mat-icon>
+┊  ┊ 9┊    </button>
+┊  ┊10┊  `,
+┊  ┊11┊  styleUrls: ['new-message.component.scss'],
+┊  ┊12┊})
+┊  ┊13┊export class NewMessageComponent {
+┊  ┊14┊  @Input()
+┊  ┊15┊  disabled: boolean;
+┊  ┊16┊
+┊  ┊17┊  @Output()
+┊  ┊18┊  newMessage = new EventEmitter<string>();
+┊  ┊19┊
+┊  ┊20┊  message = '';
+┊  ┊21┊
+┊  ┊22┊  onInputKeyup({ keyCode }: KeyboardEvent) {
+┊  ┊23┊    if (keyCode === 13) {
+┊  ┊24┊      this.emitMessage();
+┊  ┊25┊    }
+┊  ┊26┊  }
+┊  ┊27┊
+┊  ┊28┊  emitMessage() {
+┊  ┊29┊    if (this.message && !this.disabled) {
+┊  ┊30┊      this.newMessage.emit(this.message);
+┊  ┊31┊      this.message = '';
+┊  ┊32┊    }
+┊  ┊33┊  }
+┊  ┊34┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.scss
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊.container {
+┊  ┊ 2┊  display: flex;
+┊  ┊ 3┊  flex-flow: column;
+┊  ┊ 4┊  justify-content: space-between;
+┊  ┊ 5┊  height: calc(100vh - 8vh);
+┊  ┊ 6┊
+┊  ┊ 7┊  app-confirm-selection {
+┊  ┊ 8┊    bottom: 10vh;
+┊  ┊ 9┊  }
+┊  ┊10┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.ts
```diff
@@ -0,0 +1,45 @@
+┊  ┊ 1┊import {Component, OnInit} from '@angular/core';
+┊  ┊ 2┊import {ActivatedRoute, Router} from '@angular/router';
+┊  ┊ 3┊import {ChatsService} from '../../../services/chats.service';
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  template: `
+┊  ┊ 7┊    <app-toolbar>
+┊  ┊ 8┊      <button class="navigation" mat-button (click)="goToChats()">
+┊  ┊ 9┊        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
+┊  ┊10┊      </button>
+┊  ┊11┊      <div class="title">{{ name }}</div>
+┊  ┊12┊    </app-toolbar>
+┊  ┊13┊    <div class="container">
+┊  ┊14┊      <app-messages-list [items]="messages" [isGroup]="isGroup"></app-messages-list>
+┊  ┊15┊      <app-new-message></app-new-message>
+┊  ┊16┊    </div>
+┊  ┊17┊  `,
+┊  ┊18┊  styleUrls: ['./chat.component.scss']
+┊  ┊19┊})
+┊  ┊20┊export class ChatComponent implements OnInit {
+┊  ┊21┊  chatId: string;
+┊  ┊22┊  messages: any[];
+┊  ┊23┊  name: string;
+┊  ┊24┊  isGroup: boolean;
+┊  ┊25┊
+┊  ┊26┊  constructor(private route: ActivatedRoute,
+┊  ┊27┊              private router: Router,
+┊  ┊28┊              private chatsService: ChatsService) {
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  ngOnInit() {
+┊  ┊32┊    this.route.params.subscribe(({id: chatId}) => {
+┊  ┊33┊      this.chatId = chatId;
+┊  ┊34┊      this.chatsService.getChat(chatId).chat$.subscribe(chat => {
+┊  ┊35┊        this.messages = chat.messages;
+┊  ┊36┊        this.name = chat.name;
+┊  ┊37┊        this.isGroup = chat.isGroup;
+┊  ┊38┊      });
+┊  ┊39┊    });
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  goToChats() {
+┊  ┊43┊    this.router.navigate(['/chats']);
+┊  ┊44┊  }
+┊  ┊45┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.ts
```diff
@@ -1,11 +1,11 @@
-┊ 1┊  ┊import {Component, Input} from '@angular/core';
+┊  ┊ 1┊import {Component, EventEmitter, Input, Output} from '@angular/core';
 ┊ 2┊ 2┊import {GetChats} from '../../../../types';
 ┊ 3┊ 3┊
 ┊ 4┊ 4┊@Component({
 ┊ 5┊ 5┊  selector: 'app-chat-item',
 ┊ 6┊ 6┊  template: `
 ┊ 7┊ 7┊    <div class="chat-row">
-┊ 8┊  ┊        <div class="chat-recipient">
+┊  ┊ 8┊        <div class="chat-recipient" (click)="selectChat()">
 ┊ 9┊ 9┊          <img *ngIf="chat.picture" [src]="chat.picture" width="48" height="48">
 ┊10┊10┊          <div>{{ chat.name }} [id: {{ chat.id }}]</div>
 ┊11┊11┊        </div>
```
```diff
@@ -18,4 +18,11 @@
 ┊18┊18┊  // tslint:disable-next-line:no-input-rename
 ┊19┊19┊  @Input('item')
 ┊20┊20┊  chat: GetChats.Chats;
+┊  ┊21┊
+┊  ┊22┊  @Output()
+┊  ┊23┊  select = new EventEmitter<string>();
+┊  ┊24┊
+┊  ┊25┊  selectChat() {
+┊  ┊26┊    this.select.emit(this.chat.id);
+┊  ┊27┊  }
 ┊21┊28┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chats-list&#x2F;chats-list.component.ts
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊import {Component, Input} from '@angular/core';
+┊ ┊1┊import {Component, EventEmitter, Input, Output} from '@angular/core';
 ┊2┊2┊import {GetChats} from '../../../../types';
 ┊3┊3┊
 ┊4┊4┊@Component({
```
```diff
@@ -6,7 +6,7 @@
 ┊ 6┊ 6┊  template: `
 ┊ 7┊ 7┊    <mat-list>
 ┊ 8┊ 8┊      <mat-list-item *ngFor="let chat of chats">
-┊ 9┊  ┊        <app-chat-item [item]="chat"></app-chat-item>
+┊  ┊ 9┊        <app-chat-item [item]="chat" (select)="selectChat($event)"></app-chat-item>
 ┊10┊10┊      </mat-list-item>
 ┊11┊11┊    </mat-list>
 ┊12┊12┊  `,
```
```diff
@@ -17,5 +17,12 @@
 ┊17┊17┊  @Input('items')
 ┊18┊18┊  chats: GetChats.Chats[];
 ┊19┊19┊
+┊  ┊20┊  @Output()
+┊  ┊21┊  select = new EventEmitter<string>();
+┊  ┊22┊
 ┊20┊23┊  constructor() {}
+┊  ┊24┊
+┊  ┊25┊  selectChat(id: string) {
+┊  ┊26┊    this.select.emit(id);
+┊  ┊27┊  }
 ┊21┊28┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.ts
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊import {ChatsService} from '../../../services/chats.service';
 ┊3┊3┊import {Observable} from 'rxjs/Observable';
 ┊4┊4┊import {GetChats} from '../../../../types';
+┊ ┊5┊import {Router} from '@angular/router';
 ┊5┊6┊
 ┊6┊7┊@Component({
 ┊7┊8┊  template: `
```
```diff
@@ -27,7 +28,7 @@
 ┊27┊28┊      </button>
 ┊28┊29┊    </mat-menu>
 ┊29┊30┊
-┊30┊  ┊    <app-chats-list [items]="chats$ | async"></app-chats-list>
+┊  ┊31┊    <app-chats-list [items]="chats$ | async" (select)="goToChat($event)"></app-chats-list>
 ┊31┊32┊
 ┊32┊33┊    <button class="chat-button" mat-fab color="primary">
 ┊33┊34┊      <mat-icon aria-label="Icon-button with a + icon">add</mat-icon>
```
```diff
@@ -38,10 +39,15 @@
 ┊38┊39┊export class ChatsComponent implements OnInit {
 ┊39┊40┊  chats$: Observable<GetChats.Chats[]>;
 ┊40┊41┊
-┊41┊  ┊  constructor(private chatsService: ChatsService) {
+┊  ┊42┊  constructor(private chatsService: ChatsService,
+┊  ┊43┊              private router: Router) {
 ┊42┊44┊  }
 ┊43┊45┊
 ┊44┊46┊  ngOnInit() {
 ┊45┊47┊    this.chats$ = this.chatsService.getChats().chats$;
 ┊46┊48┊  }
+┊  ┊49┊
+┊  ┊50┊  goToChat(chatId: string) {
+┊  ┊51┊    this.router.navigate(['/chat', chatId]);
+┊  ┊52┊  }
 ┊47┊53┊}
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -4,6 +4,7 @@
 ┊ 4┊ 4┊import {Injectable} from '@angular/core';
 ┊ 5┊ 5┊import {getChatsQuery} from '../../graphql/getChats.query';
 ┊ 6┊ 6┊import {GetChats} from '../../types';
+┊  ┊ 7┊import {getChatQuery} from '../../graphql/getChat.query';
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊@Injectable()
 ┊ 9┊10┊export class ChatsService {
```
```diff
@@ -20,4 +21,19 @@
 ┊20┊21┊
 ┊21┊22┊    return {query, chats$};
 ┊22┊23┊  }
+┊  ┊24┊
+┊  ┊25┊  getChat(chatId: string) {
+┊  ┊26┊    const query = this.apollo.watchQuery<any>({
+┊  ┊27┊      query: getChatQuery,
+┊  ┊28┊      variables: {
+┊  ┊29┊        chatId: chatId,
+┊  ┊30┊      }
+┊  ┊31┊    });
+┊  ┊32┊
+┊  ┊33┊    const chat$ = query.valueChanges.pipe(
+┊  ┊34┊      map((result: ApolloQueryResult<any>) => result.data.chat)
+┊  ┊35┊    );
+┊  ┊36┊
+┊  ┊37┊    return {query, chat$};
+┊  ┊38┊  }
 ┊23┊39┊}
```

##### Added src&#x2F;graphql&#x2F;getChat.query.ts
```diff
@@ -0,0 +1,34 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊
+┊  ┊ 3┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 4┊export const getChatQuery = gql`
+┊  ┊ 5┊  query GetChat($chatId: ID!) {
+┊  ┊ 6┊    chat(chatId: $chatId) {
+┊  ┊ 7┊      id,
+┊  ┊ 8┊      __typename,
+┊  ┊ 9┊      name,
+┊  ┊10┊      picture,
+┊  ┊11┊      isGroup,
+┊  ┊12┊      messages {
+┊  ┊13┊        id,
+┊  ┊14┊        __typename,
+┊  ┊15┊        senderId,
+┊  ┊16┊        sender {
+┊  ┊17┊          id,
+┊  ┊18┊          __typename,
+┊  ┊19┊          name,
+┊  ┊20┊        },
+┊  ┊21┊        content,
+┊  ┊22┊        createdAt,
+┊  ┊23┊        type,
+┊  ┊24┊        recipients {
+┊  ┊25┊          id,
+┊  ┊26┊          __typename,
+┊  ┊27┊          receivedAt,
+┊  ┊28┊          readAt,
+┊  ┊29┊        },
+┊  ┊30┊        ownership,
+┊  ┊31┊      },
+┊  ┊32┊    }
+┊  ┊33┊  }
+┊  ┊34┊`;
```

[}]: #

It's time to generate our types and use them:

    $ npm run generator

[{]: <helper> (diffStep "4.2" files="^\(?!src/types.d.ts$\).*")

#### Step 4.2: Add generated types

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;message-item&#x2F;message-item.component.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import {Component, Input} from '@angular/core';
+┊ ┊2┊import {GetChat} from '../../../../types';
 ┊2┊3┊
 ┊3┊4┊@Component({
 ┊4┊5┊  selector: 'app-message-item',
```
```diff
@@ -14,7 +15,7 @@
 ┊14┊15┊export class MessageItemComponent {
 ┊15┊16┊  // tslint:disable-next-line:no-input-rename
 ┊16┊17┊  @Input('item')
-┊17┊  ┊  message: any;
+┊  ┊18┊  message: GetChat.Messages;
 ┊18┊19┊
 ┊19┊20┊  @Input()
 ┊20┊21┊  isGroup: boolean;
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;messages-list&#x2F;messages-list.component.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import {Component, Input} from '@angular/core';
+┊ ┊2┊import {GetChat} from '../../../../types';
 ┊2┊3┊
 ┊3┊4┊@Component({
 ┊4┊5┊  selector: 'app-messages-list',
```
```diff
@@ -14,7 +15,7 @@
 ┊14┊15┊export class MessagesListComponent {
 ┊15┊16┊  // tslint:disable-next-line:no-input-rename
 ┊16┊17┊  @Input('items')
-┊17┊  ┊  messages: any[];
+┊  ┊18┊  messages: GetChat.Messages[];
 ┊18┊19┊
 ┊19┊20┊  @Input()
 ┊20┊21┊  isGroup: boolean;
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.ts
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import {Component, OnInit} from '@angular/core';
 ┊2┊2┊import {ActivatedRoute, Router} from '@angular/router';
 ┊3┊3┊import {ChatsService} from '../../../services/chats.service';
+┊ ┊4┊import {GetChat} from '../../../../types';
 ┊4┊5┊
 ┊5┊6┊@Component({
 ┊6┊7┊  template: `
```
```diff
@@ -19,7 +20,7 @@
 ┊19┊20┊})
 ┊20┊21┊export class ChatComponent implements OnInit {
 ┊21┊22┊  chatId: string;
-┊22┊  ┊  messages: any[];
+┊  ┊23┊  messages: GetChat.Messages[];
 ┊23┊24┊  name: string;
 ┊24┊25┊  isGroup: boolean;
 ┊25┊26┊
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -3,7 +3,7 @@
 ┊3┊3┊import {Apollo} from 'apollo-angular';
 ┊4┊4┊import {Injectable} from '@angular/core';
 ┊5┊5┊import {getChatsQuery} from '../../graphql/getChats.query';
-┊6┊ ┊import {GetChats} from '../../types';
+┊ ┊6┊import {GetChat, GetChats} from '../../types';
 ┊7┊7┊import {getChatQuery} from '../../graphql/getChat.query';
 ┊8┊8┊
 ┊9┊9┊@Injectable()
```
```diff
@@ -23,7 +23,7 @@
 ┊23┊23┊  }
 ┊24┊24┊
 ┊25┊25┊  getChat(chatId: string) {
-┊26┊  ┊    const query = this.apollo.watchQuery<any>({
+┊  ┊26┊    const query = this.apollo.watchQuery<GetChat.Query>({
 ┊27┊27┊      query: getChatQuery,
 ┊28┊28┊      variables: {
 ┊29┊29┊        chatId: chatId,
```
```diff
@@ -31,7 +31,7 @@
 ┊31┊31┊    });
 ┊32┊32┊
 ┊33┊33┊    const chat$ = query.valueChanges.pipe(
-┊34┊  ┊      map((result: ApolloQueryResult<any>) => result.data.chat)
+┊  ┊34┊      map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
 ┊35┊35┊    );
 ┊36┊36┊
 ┊37┊37┊    return {query, chat$};
```

[}]: #

[{]: <helper> (diffStep "4.3")

#### Step 4.3: Testing

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.spec.ts
```diff
@@ -0,0 +1,139 @@
+┊   ┊  1┊import { async, ComponentFixture, TestBed } from '@angular/core/testing';
+┊   ┊  2┊
+┊   ┊  3┊import { ChatComponent } from './chat.component';
+┊   ┊  4┊import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
+┊   ┊  5┊import {MatButtonModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';
+┊   ┊  6┊import {ChatsService} from '../../../services/chats.service';
+┊   ┊  7┊import {Apollo} from 'apollo-angular';
+┊   ┊  8┊import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
+┊   ┊  9┊import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
+┊   ┊ 10┊import {InMemoryCache} from 'apollo-cache-inmemory';
+┊   ┊ 11┊import {RouterTestingModule} from '@angular/router/testing';
+┊   ┊ 12┊import {ActivatedRoute} from '@angular/router';
+┊   ┊ 13┊import {of} from 'rxjs/observable/of';
+┊   ┊ 14┊import {By} from '@angular/platform-browser';
+┊   ┊ 15┊import {FormsModule} from '@angular/forms';
+┊   ┊ 16┊import {SharedModule} from '../../../shared/shared.module';
+┊   ┊ 17┊import {NewMessageComponent} from '../../components/new-message/new-message.component';
+┊   ┊ 18┊import {MessagesListComponent} from '../../components/messages-list/messages-list.component';
+┊   ┊ 19┊import {MessageItemComponent} from '../../components/message-item/message-item.component';
+┊   ┊ 20┊
+┊   ┊ 21┊describe('ChatComponent', () => {
+┊   ┊ 22┊  let component: ChatComponent;
+┊   ┊ 23┊  let fixture: ComponentFixture<ChatComponent>;
+┊   ┊ 24┊  let el: DebugElement;
+┊   ┊ 25┊
+┊   ┊ 26┊  let httpMock: HttpTestingController;
+┊   ┊ 27┊  let httpLink: HttpLink;
+┊   ┊ 28┊  let apollo: Apollo;
+┊   ┊ 29┊
+┊   ┊ 30┊  const chat = {
+┊   ┊ 31┊    id: '1',
+┊   ┊ 32┊    __typename: 'Chat',
+┊   ┊ 33┊    name: 'Avery Stewart',
+┊   ┊ 34┊    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
+┊   ┊ 35┊    userIds: [
+┊   ┊ 36┊      '1',
+┊   ┊ 37┊      '3'
+┊   ┊ 38┊    ],
+┊   ┊ 39┊    unreadMessages: 1,
+┊   ┊ 40┊    messages: [
+┊   ┊ 41┊      {
+┊   ┊ 42┊        id: '708323562255',
+┊   ┊ 43┊        __typename: 'Message',
+┊   ┊ 44┊        senderId: '3',
+┊   ┊ 45┊        sender: {
+┊   ┊ 46┊          id: '3',
+┊   ┊ 47┊          __typename: 'User',
+┊   ┊ 48┊          name: 'Avery Stewart'
+┊   ┊ 49┊        },
+┊   ┊ 50┊        content: 'Yep!',
+┊   ┊ 51┊        createdAt: 1514035700,
+┊   ┊ 52┊        type: 0,
+┊   ┊ 53┊        recipients: [
+┊   ┊ 54┊          {
+┊   ┊ 55┊            id: '1',
+┊   ┊ 56┊            __typename: 'Recipient',
+┊   ┊ 57┊            receivedAt: null,
+┊   ┊ 58┊            readAt: null
+┊   ┊ 59┊          }
+┊   ┊ 60┊        ],
+┊   ┊ 61┊        ownership: false
+┊   ┊ 62┊      }]
+┊   ┊ 63┊    ,
+┊   ┊ 64┊    isGroup: false
+┊   ┊ 65┊  };
+┊   ┊ 66┊
+┊   ┊ 67┊  beforeEach(async(() => {
+┊   ┊ 68┊    TestBed.configureTestingModule({
+┊   ┊ 69┊      declarations: [
+┊   ┊ 70┊        ChatComponent,
+┊   ┊ 71┊        MessagesListComponent,
+┊   ┊ 72┊        MessageItemComponent,
+┊   ┊ 73┊        NewMessageComponent,
+┊   ┊ 74┊      ],
+┊   ┊ 75┊      imports: [
+┊   ┊ 76┊        MatToolbarModule,
+┊   ┊ 77┊        MatMenuModule,
+┊   ┊ 78┊        MatIconModule,
+┊   ┊ 79┊        MatButtonModule,
+┊   ┊ 80┊        MatListModule,
+┊   ┊ 81┊        MatGridListModule,
+┊   ┊ 82┊        FormsModule,
+┊   ┊ 83┊        SharedModule,
+┊   ┊ 84┊        HttpLinkModule,
+┊   ┊ 85┊        HttpClientTestingModule,
+┊   ┊ 86┊        RouterTestingModule
+┊   ┊ 87┊      ],
+┊   ┊ 88┊      providers: [
+┊   ┊ 89┊        ChatsService,
+┊   ┊ 90┊        Apollo,
+┊   ┊ 91┊        {
+┊   ┊ 92┊          provide: ActivatedRoute,
+┊   ┊ 93┊          useValue: { params: of({ id: chat.id }) }
+┊   ┊ 94┊        }
+┊   ┊ 95┊      ],
+┊   ┊ 96┊      schemas: [NO_ERRORS_SCHEMA]
+┊   ┊ 97┊    })
+┊   ┊ 98┊      .compileComponents();
+┊   ┊ 99┊
+┊   ┊100┊    httpMock = TestBed.get(HttpTestingController);
+┊   ┊101┊    httpLink = TestBed.get(HttpLink);
+┊   ┊102┊    apollo = TestBed.get(Apollo);
+┊   ┊103┊
+┊   ┊104┊    apollo.create({
+┊   ┊105┊      link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
+┊   ┊106┊      cache: new InMemoryCache()
+┊   ┊107┊    });
+┊   ┊108┊  }));
+┊   ┊109┊
+┊   ┊110┊  beforeEach(() => {
+┊   ┊111┊    fixture = TestBed.createComponent(ChatComponent);
+┊   ┊112┊    component = fixture.componentInstance;
+┊   ┊113┊    fixture.detectChanges();
+┊   ┊114┊    const req = httpMock.expectOne('http://localhost:3000/graphql', 'call to api');
+┊   ┊115┊    req.flush({
+┊   ┊116┊      data: {
+┊   ┊117┊        chat
+┊   ┊118┊      }
+┊   ┊119┊    });
+┊   ┊120┊  });
+┊   ┊121┊
+┊   ┊122┊  it('should create', () => {
+┊   ┊123┊    expect(component).toBeTruthy();
+┊   ┊124┊  });
+┊   ┊125┊
+┊   ┊126┊  it('should display the chat', () => {
+┊   ┊127┊    fixture.whenStable().then(() => {
+┊   ┊128┊      fixture.detectChanges();
+┊   ┊129┊      el = fixture.debugElement;
+┊   ┊130┊      expect(el.query(By.css(`app-toolbar > mat-toolbar > div > div`)).nativeElement.textContent).toContain(chat.name);
+┊   ┊131┊      for (let i = 0; i < chat.messages.length; i++) {
+┊   ┊132┊        expect(el.query(By.css(`app-messages-list > mat-list > mat-list-item:nth-child(${i + 1}) > div > app-message-item > div`))
+┊   ┊133┊          .nativeElement.textContent).toContain(chat.messages[i].content);
+┊   ┊134┊      }
+┊   ┊135┊    });
+┊   ┊136┊
+┊   ┊137┊    httpMock.verify();
+┊   ┊138┊  });
+┊   ┊139┊});
```

[}]: #

# Chapter 9

In the client, let's start by wiring the addMessage mutation. We're going to write the GraphQL query and then use the generator to generate the types:

[{]: <helper> (diffStep "5.1" files="^\(?!src/types.d.ts$\).*")

#### Step 5.1: Create addMessage mutation and generate types

##### Added src&#x2F;graphql&#x2F;addMessage.mutation.ts
```diff
@@ -0,0 +1,27 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊
+┊  ┊ 3┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 4┊export const addMessageMutation = gql`
+┊  ┊ 5┊  mutation AddMessage($chatId: ID!, $content: String!) {
+┊  ┊ 6┊    addMessage(chatId: $chatId, content: $content) {
+┊  ┊ 7┊        id,
+┊  ┊ 8┊        __typename,
+┊  ┊ 9┊        senderId,
+┊  ┊10┊        sender {
+┊  ┊11┊          id,
+┊  ┊12┊          __typename,
+┊  ┊13┊          name,
+┊  ┊14┊        },
+┊  ┊15┊        content,
+┊  ┊16┊        createdAt,
+┊  ┊17┊        type,
+┊  ┊18┊        recipients {
+┊  ┊19┊          id,
+┊  ┊20┊          __typename,
+┊  ┊21┊          receivedAt,
+┊  ┊22┊          readAt,
+┊  ┊23┊        },
+┊  ┊24┊        ownership,
+┊  ┊25┊    }
+┊  ┊26┊  }
+┊  ┊27┊`;
```

[}]: #

    $ npm run generator

Now let's use the just-created query:

[{]: <helper> (diffStep "5.2")

#### Step 5.2: Modify chat component and service

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.ts
```diff
@@ -13,7 +13,7 @@
 ┊13┊13┊    </app-toolbar>
 ┊14┊14┊    <div class="container">
 ┊15┊15┊      <app-messages-list [items]="messages" [isGroup]="isGroup"></app-messages-list>
-┊16┊  ┊      <app-new-message></app-new-message>
+┊  ┊16┊      <app-new-message (newMessage)="addMessage($event)"></app-new-message>
 ┊17┊17┊    </div>
 ┊18┊18┊  `,
 ┊19┊19┊  styleUrls: ['./chat.component.scss']
```
```diff
@@ -43,4 +43,8 @@
 ┊43┊43┊  goToChats() {
 ┊44┊44┊    this.router.navigate(['/chats']);
 ┊45┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  addMessage(content: string) {
+┊  ┊48┊    this.chatsService.addMessage(this.chatId, content).subscribe();
+┊  ┊49┊  }
 ┊46┊50┊}
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -3,8 +3,9 @@
 ┊ 3┊ 3┊import {Apollo} from 'apollo-angular';
 ┊ 4┊ 4┊import {Injectable} from '@angular/core';
 ┊ 5┊ 5┊import {getChatsQuery} from '../../graphql/getChats.query';
-┊ 6┊  ┊import {GetChat, GetChats} from '../../types';
+┊  ┊ 6┊import {AddMessage, GetChat, GetChats} from '../../types';
 ┊ 7┊ 7┊import {getChatQuery} from '../../graphql/getChat.query';
+┊  ┊ 8┊import {addMessageMutation} from '../../graphql/addMessage.mutation';
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Injectable()
 ┊10┊11┊export class ChatsService {
```
```diff
@@ -36,4 +37,14 @@
 ┊36┊37┊
 ┊37┊38┊    return {query, chat$};
 ┊38┊39┊  }
+┊  ┊40┊
+┊  ┊41┊  addMessage(chatId: string, content: string) {
+┊  ┊42┊    return this.apollo.mutate({
+┊  ┊43┊      mutation: addMessageMutation,
+┊  ┊44┊      variables: <AddMessage.Variables>{
+┊  ┊45┊        chatId,
+┊  ┊46┊        content,
+┊  ┊47┊      },
+┊  ┊48┊    });
+┊  ┊49┊  }
 ┊39┊50┊}
```

[}]: #

# Chapter 10

Did you notice that after creating a new message you'll have to refresh the page in order to see it?
How to fix that? If you thought about re-querying the server you would be wrong! The best solution is to use the response provided by the server to update our Apollo local cache:

[{]: <helper> (diffStep "6.1")

#### Step 6.1: Update the store

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -45,6 +45,30 @@
 ┊45┊45┊        chatId,
 ┊46┊46┊        content,
 ┊47┊47┊      },
+┊  ┊48┊      update: (store, { data: { addMessage } }: {data: AddMessage.Mutation}) => {
+┊  ┊49┊        // Update the messages cache
+┊  ┊50┊        {
+┊  ┊51┊          // Read the data from our cache for this query.
+┊  ┊52┊          const {chat}: GetChat.Query = store.readQuery({
+┊  ┊53┊            query: getChatQuery, variables: {
+┊  ┊54┊              chatId,
+┊  ┊55┊            }
+┊  ┊56┊          });
+┊  ┊57┊          // Add our message from the mutation to the end.
+┊  ┊58┊          chat.messages.push(addMessage);
+┊  ┊59┊          // Write our data back to the cache.
+┊  ┊60┊          store.writeQuery({ query: getChatQuery, data: {chat} });
+┊  ┊61┊        }
+┊  ┊62┊        // Update last message cache
+┊  ┊63┊        {
+┊  ┊64┊          // Read the data from our cache for this query.
+┊  ┊65┊          const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
+┊  ┊66┊          // Add our comment from the mutation to the end.
+┊  ┊67┊          chats.find(chat => chat.id === chatId).lastMessage = addMessage;
+┊  ┊68┊          // Write our data back to the cache.
+┊  ┊69┊          store.writeQuery({ query: getChatsQuery, data: {chats} });
+┊  ┊70┊        }
+┊  ┊71┊      },
 ┊48┊72┊    });
 ┊49┊73┊  }
 ┊50┊74┊}
```

[}]: #

# Chapter 11

Since we're now familiar with the way mutations work, it's time to add messages and chats removal to our list of features!
Since the most annoying part is going to be dealing with the user interface (because a multiple selection started by a press event is involved), I created an Angular directive to ease the process.
Let's start by installing it:

    $ npm install ngx-selectable-list

Now let's import it:

[{]: <helper> (diffStep "7.1" files="chats-lister.module.ts")

#### Step 7.1: Add SelectableListModule

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;chats-lister.module.ts
```diff
@@ -11,6 +11,7 @@
 ┊11┊11┊import {ChatsListComponent} from './components/chats-list/chats-list.component';
 ┊12┊12┊import {TruncateModule} from 'ng2-truncate';
 ┊13┊13┊import {SharedModule} from '../shared/shared.module';
+┊  ┊14┊import {SelectableListModule} from 'ngx-selectable-list';
 ┊14┊15┊
 ┊15┊16┊const routes: Routes = [
 ┊16┊17┊  {path: 'chats', component: ChatsComponent},
```
```diff
@@ -39,6 +40,7 @@
 ┊39┊40┊    TruncateModule,
 ┊40┊41┊    // Feature modules
 ┊41┊42┊    SharedModule,
+┊  ┊43┊    SelectableListModule,
 ┊42┊44┊  ],
 ┊43┊45┊  providers: [
 ┊44┊46┊    ChatsService,
```

[}]: #

Let's create the mutations:

[{]: <helper> (diffStep "7.2" files="src/graphql")

#### Step 7.2: Remove messages and chats

##### Added src&#x2F;graphql&#x2F;removeAllMessages.mutation.ts
```diff
@@ -0,0 +1,9 @@
+┊ ┊1┊import gql from 'graphql-tag';
+┊ ┊2┊
+┊ ┊3┊// We use the gql tag to parse our query string into a query document
+┊ ┊4┊// Issue 195: https://github.com/apollographql/apollo-codegen/issues/195
+┊ ┊5┊export const removeAllMessagesMutation = gql`
+┊ ┊6┊  mutation RemoveAllMessages($chatId: ID!, $all: Boolean) {
+┊ ┊7┊    removeMessages(chatId: $chatId, all: $all)
+┊ ┊8┊  }
+┊ ┊9┊`;
```

##### Added src&#x2F;graphql&#x2F;removeChat.mutation.ts
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊import gql from 'graphql-tag';
+┊ ┊2┊
+┊ ┊3┊// We use the gql tag to parse our query string into a query document
+┊ ┊4┊export const removeChatMutation = gql`
+┊ ┊5┊  mutation RemoveChat($chatId: ID!) {
+┊ ┊6┊    removeChat(chatId: $chatId)
+┊ ┊7┊  }
+┊ ┊8┊`;
```

##### Added src&#x2F;graphql&#x2F;removeMessages.mutation.ts
```diff
@@ -0,0 +1,9 @@
+┊ ┊1┊import gql from 'graphql-tag';
+┊ ┊2┊
+┊ ┊3┊// We use the gql tag to parse our query string into a query document
+┊ ┊4┊// Issue 195: https://github.com/apollographql/apollo-codegen/issues/195
+┊ ┊5┊export const removeMessagesMutation = gql`
+┊ ┊6┊  mutation RemoveMessages($chatId: ID!, $messageIds: [ID]) {
+┊ ┊7┊    removeMessages(chatId: $chatId, messageIds: $messageIds)
+┊ ┊8┊  }
+┊ ┊9┊`;
```

[}]: #

Now let's update our service:

[{]: <helper> (diffStep "7.2" files="chats.service.ts")

#### Step 7.2: Remove messages and chats

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -3,9 +3,13 @@
 ┊ 3┊ 3┊import {Apollo} from 'apollo-angular';
 ┊ 4┊ 4┊import {Injectable} from '@angular/core';
 ┊ 5┊ 5┊import {getChatsQuery} from '../../graphql/getChats.query';
-┊ 6┊  ┊import {AddMessage, GetChat, GetChats} from '../../types';
+┊  ┊ 6┊import {AddMessage, GetChat, GetChats, RemoveAllMessages, RemoveChat, RemoveMessages} from '../../types';
 ┊ 7┊ 7┊import {getChatQuery} from '../../graphql/getChat.query';
 ┊ 8┊ 8┊import {addMessageMutation} from '../../graphql/addMessage.mutation';
+┊  ┊ 9┊import {removeChatMutation} from '../../graphql/removeChat.mutation';
+┊  ┊10┊import {DocumentNode} from 'graphql';
+┊  ┊11┊import {removeAllMessagesMutation} from '../../graphql/removeAllMessages.mutation';
+┊  ┊12┊import {removeMessagesMutation} from '../../graphql/removeMessages.mutation';
 ┊ 9┊13┊
 ┊10┊14┊@Injectable()
 ┊11┊15┊export class ChatsService {
```
```diff
@@ -71,4 +75,78 @@
 ┊ 71┊ 75┊      },
 ┊ 72┊ 76┊    });
 ┊ 73┊ 77┊  }
+┊   ┊ 78┊
+┊   ┊ 79┊  removeChat(chatId: string) {
+┊   ┊ 80┊    return this.apollo.mutate({
+┊   ┊ 81┊      mutation: removeChatMutation,
+┊   ┊ 82┊      variables: <RemoveChat.Variables>{
+┊   ┊ 83┊        chatId,
+┊   ┊ 84┊      },
+┊   ┊ 85┊      update: (store, { data: { removeChat } }) => {
+┊   ┊ 86┊        // Read the data from our cache for this query.
+┊   ┊ 87┊        const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
+┊   ┊ 88┊        // Remove the chat (mutable)
+┊   ┊ 89┊        for (const index of chats.keys()) {
+┊   ┊ 90┊          if (chats[index].id === removeChat) {
+┊   ┊ 91┊            chats.splice(index, 1);
+┊   ┊ 92┊          }
+┊   ┊ 93┊        }
+┊   ┊ 94┊        // Write our data back to the cache.
+┊   ┊ 95┊        store.writeQuery({ query: getChatsQuery, data: {chats} });
+┊   ┊ 96┊      },
+┊   ┊ 97┊    });
+┊   ┊ 98┊  }
+┊   ┊ 99┊
+┊   ┊100┊  removeMessages(chatId: string, messages: GetChat.Messages[], messageIdsOrAll: string[] | boolean) {
+┊   ┊101┊    let variables: RemoveMessages.Variables | RemoveAllMessages.Variables;
+┊   ┊102┊    let ids: string[];
+┊   ┊103┊    let mutation: DocumentNode;
+┊   ┊104┊
+┊   ┊105┊    if (typeof messageIdsOrAll === 'boolean') {
+┊   ┊106┊      variables = {chatId, all: messageIdsOrAll};
+┊   ┊107┊      ids = messages.map(message => message.id);
+┊   ┊108┊      mutation = removeAllMessagesMutation;
+┊   ┊109┊    } else {
+┊   ┊110┊      variables = {chatId, messageIds: messageIdsOrAll};
+┊   ┊111┊      ids = messageIdsOrAll;
+┊   ┊112┊      mutation = removeMessagesMutation;
+┊   ┊113┊    }
+┊   ┊114┊
+┊   ┊115┊    return this.apollo.mutate({
+┊   ┊116┊      mutation,
+┊   ┊117┊      variables,
+┊   ┊118┊      update: (store, { data: { removeMessages } }: {data: RemoveMessages.Mutation | RemoveAllMessages.Mutation}) => {
+┊   ┊119┊        // Update the messages cache
+┊   ┊120┊        {
+┊   ┊121┊          // Read the data from our cache for this query.
+┊   ┊122┊          const {chat}: GetChat.Query = store.readQuery({
+┊   ┊123┊            query: getChatQuery, variables: {
+┊   ┊124┊              chatId,
+┊   ┊125┊            }
+┊   ┊126┊          });
+┊   ┊127┊          // Remove the messages (mutable)
+┊   ┊128┊          removeMessages.forEach(messageId => {
+┊   ┊129┊            for (const index of chat.messages.keys()) {
+┊   ┊130┊              if (chat.messages[index].id === messageId) {
+┊   ┊131┊                chat.messages.splice(index, 1);
+┊   ┊132┊              }
+┊   ┊133┊            }
+┊   ┊134┊          });
+┊   ┊135┊          // Write our data back to the cache.
+┊   ┊136┊          store.writeQuery({ query: getChatQuery, data: {chat} });
+┊   ┊137┊        }
+┊   ┊138┊        // Update last message cache
+┊   ┊139┊        {
+┊   ┊140┊          // Read the data from our cache for this query.
+┊   ┊141┊          const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
+┊   ┊142┊          // Fix last comment
+┊   ┊143┊          chats.find(chat => chat.id === chatId).lastMessage = messages
+┊   ┊144┊            .filter(message => !ids.includes(message.id))
+┊   ┊145┊            .sort((a, b) => b.createdAt - a.createdAt)[0] || null;
+┊   ┊146┊          // Write our data back to the cache.
+┊   ┊147┊          store.writeQuery({ query: getChatsQuery, data: {chats} });
+┊   ┊148┊        }
+┊   ┊149┊      },
+┊   ┊150┊    });
+┊   ┊151┊  }
 ┊ 74┊152┊}
```

[}]: #

And finally wire everything up into our components:

[{]: <helper> (diffStep "7.2" files="src/app/chat-viewer, src/app/chats-lister, src/app/shared")

#### Step 7.2: Remove messages and chats

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;chat-viewer.module.ts
```diff
@@ -11,6 +11,7 @@
 ┊11┊11┊import {MessageItemComponent} from './components/message-item/message-item.component';
 ┊12┊12┊import {NewMessageComponent} from './components/new-message/new-message.component';
 ┊13┊13┊import {SharedModule} from '../shared/shared.module';
+┊  ┊14┊import {SelectableListModule} from 'ngx-selectable-list';
 ┊14┊15┊
 ┊15┊16┊const routes: Routes = [
 ┊16┊17┊  {
```
```diff
@@ -44,6 +45,7 @@
 ┊44┊45┊    FormsModule,
 ┊45┊46┊    // Feature modules
 ┊46┊47┊    SharedModule,
+┊  ┊48┊    SelectableListModule,
 ┊47┊49┊  ],
 ┊48┊50┊  providers: [
 ┊49┊51┊    ChatsService,
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;messages-list&#x2F;messages-list.component.ts
```diff
@@ -1,14 +1,17 @@
 ┊ 1┊ 1┊import {Component, Input} from '@angular/core';
 ┊ 2┊ 2┊import {GetChat} from '../../../../types';
+┊  ┊ 3┊import {SelectableListDirective} from 'ngx-selectable-list';
 ┊ 3┊ 4┊
 ┊ 4┊ 5┊@Component({
 ┊ 5┊ 6┊  selector: 'app-messages-list',
 ┊ 6┊ 7┊  template: `
 ┊ 7┊ 8┊    <mat-list>
 ┊ 8┊ 9┊      <mat-list-item *ngFor="let message of messages">
-┊ 9┊  ┊        <app-message-item [item]="message" [isGroup]="isGroup"></app-message-item>
+┊  ┊10┊        <app-message-item [item]="message" [isGroup]="isGroup"
+┊  ┊11┊                          appSelectableItem></app-message-item>
 ┊10┊12┊      </mat-list-item>
 ┊11┊13┊    </mat-list>
+┊  ┊14┊    <ng-content *ngIf="selectableListDirective.selecting"></ng-content>
 ┊12┊15┊  `,
 ┊13┊16┊  styleUrls: ['messages-list.component.scss'],
 ┊14┊17┊})
```
```diff
@@ -20,5 +23,5 @@
 ┊20┊23┊  @Input()
 ┊21┊24┊  isGroup: boolean;
 ┊22┊25┊
-┊23┊  ┊  constructor() {}
+┊  ┊26┊  constructor(public selectableListDirective: SelectableListDirective) {}
 ┊24┊27┊}
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.spec.ts
```diff
@@ -17,6 +17,7 @@
 ┊17┊17┊import {NewMessageComponent} from '../../components/new-message/new-message.component';
 ┊18┊18┊import {MessagesListComponent} from '../../components/messages-list/messages-list.component';
 ┊19┊19┊import {MessageItemComponent} from '../../components/message-item/message-item.component';
+┊  ┊20┊import {SelectableListModule} from 'ngx-selectable-list';
 ┊20┊21┊
 ┊21┊22┊describe('ChatComponent', () => {
 ┊22┊23┊  let component: ChatComponent;
```
```diff
@@ -83,7 +84,8 @@
 ┊83┊84┊        SharedModule,
 ┊84┊85┊        HttpLinkModule,
 ┊85┊86┊        HttpClientTestingModule,
-┊86┊  ┊        RouterTestingModule
+┊  ┊87┊        RouterTestingModule,
+┊  ┊88┊        SelectableListModule,
 ┊87┊89┊      ],
 ┊88┊90┊      providers: [
 ┊89┊91┊        ChatsService,
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.ts
```diff
@@ -12,7 +12,10 @@
 ┊12┊12┊      <div class="title">{{ name }}</div>
 ┊13┊13┊    </app-toolbar>
 ┊14┊14┊    <div class="container">
-┊15┊  ┊      <app-messages-list [items]="messages" [isGroup]="isGroup"></app-messages-list>
+┊  ┊15┊      <app-messages-list [items]="messages" [isGroup]="isGroup"
+┊  ┊16┊                         appSelectableList="multiple_press" (multiple)="deleteMessages($event)">
+┊  ┊17┊        <app-confirm-selection #confirmSelection></app-confirm-selection>
+┊  ┊18┊      </app-messages-list>
 ┊16┊19┊      <app-new-message (newMessage)="addMessage($event)"></app-new-message>
 ┊17┊20┊    </div>
 ┊18┊21┊  `,
```
```diff
@@ -47,4 +50,8 @@
 ┊47┊50┊  addMessage(content: string) {
 ┊48┊51┊    this.chatsService.addMessage(this.chatId, content).subscribe();
 ┊49┊52┊  }
+┊  ┊53┊
+┊  ┊54┊  deleteMessages(messageIds: string[]) {
+┊  ┊55┊    this.chatsService.removeMessages(this.chatId, this.messages, messageIds).subscribe();
+┊  ┊56┊  }
 ┊50┊57┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.ts
```diff
@@ -5,7 +5,7 @@
 ┊ 5┊ 5┊  selector: 'app-chat-item',
 ┊ 6┊ 6┊  template: `
 ┊ 7┊ 7┊    <div class="chat-row">
-┊ 8┊  ┊        <div class="chat-recipient" (click)="selectChat()">
+┊  ┊ 8┊        <div class="chat-recipient">
 ┊ 9┊ 9┊          <img *ngIf="chat.picture" [src]="chat.picture" width="48" height="48">
 ┊10┊10┊          <div>{{ chat.name }} [id: {{ chat.id }}]</div>
 ┊11┊11┊        </div>
```
```diff
@@ -18,11 +18,4 @@
 ┊18┊18┊  // tslint:disable-next-line:no-input-rename
 ┊19┊19┊  @Input('item')
 ┊20┊20┊  chat: GetChats.Chats;
-┊21┊  ┊
-┊22┊  ┊  @Output()
-┊23┊  ┊  select = new EventEmitter<string>();
-┊24┊  ┊
-┊25┊  ┊  selectChat() {
-┊26┊  ┊    this.select.emit(this.chat.id);
-┊27┊  ┊  }
 ┊28┊21┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chats-list&#x2F;chats-list.component.ts
```diff
@@ -1,14 +1,17 @@
-┊ 1┊  ┊import {Component, EventEmitter, Input, Output} from '@angular/core';
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
 ┊ 2┊ 2┊import {GetChats} from '../../../../types';
+┊  ┊ 3┊import {SelectableListDirective} from 'ngx-selectable-list';
 ┊ 3┊ 4┊
 ┊ 4┊ 5┊@Component({
 ┊ 5┊ 6┊  selector: 'app-chats-list',
 ┊ 6┊ 7┊  template: `
 ┊ 7┊ 8┊    <mat-list>
 ┊ 8┊ 9┊      <mat-list-item *ngFor="let chat of chats">
-┊ 9┊  ┊        <app-chat-item [item]="chat" (select)="selectChat($event)"></app-chat-item>
+┊  ┊10┊        <app-chat-item [item]="chat"
+┊  ┊11┊                       appSelectableItem></app-chat-item>
 ┊10┊12┊      </mat-list-item>
 ┊11┊13┊    </mat-list>
+┊  ┊14┊    <ng-content *ngIf="selectableListDirective.selecting"></ng-content>
 ┊12┊15┊  `,
 ┊13┊16┊  styleUrls: ['chats-list.component.scss'],
 ┊14┊17┊})
```
```diff
@@ -17,12 +20,5 @@
 ┊17┊20┊  @Input('items')
 ┊18┊21┊  chats: GetChats.Chats[];
 ┊19┊22┊
-┊20┊  ┊  @Output()
-┊21┊  ┊  select = new EventEmitter<string>();
-┊22┊  ┊
-┊23┊  ┊  constructor() {}
-┊24┊  ┊
-┊25┊  ┊  selectChat(id: string) {
-┊26┊  ┊    this.select.emit(id);
-┊27┊  ┊  }
+┊  ┊23┊  constructor(public selectableListDirective: SelectableListDirective) {}
 ┊28┊24┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.spec.ts
```diff
@@ -15,6 +15,7 @@
 ┊15┊15┊import {InMemoryCache} from 'apollo-cache-inmemory';
 ┊16┊16┊import {BrowserModule, By} from '@angular/platform-browser';
 ┊17┊17┊import {RouterTestingModule} from '@angular/router/testing';
+┊  ┊18┊import {SelectableListModule} from 'ngx-selectable-list';
 ┊18┊19┊
 ┊19┊20┊describe('ChatsComponent', () => {
 ┊20┊21┊  let component: ChatsComponent;
```
```diff
@@ -200,7 +201,8 @@
 ┊200┊201┊        TruncateModule,
 ┊201┊202┊        HttpLinkModule,
 ┊202┊203┊        HttpClientTestingModule,
-┊203┊   ┊        RouterTestingModule
+┊   ┊204┊        RouterTestingModule,
+┊   ┊205┊        SelectableListModule,
 ┊204┊206┊      ],
 ┊205┊207┊      providers: [
 ┊206┊208┊        ChatsService,
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.ts
```diff
@@ -28,9 +28,13 @@
 ┊28┊28┊      </button>
 ┊29┊29┊    </mat-menu>
 ┊30┊30┊
-┊31┊  ┊    <app-chats-list [items]="chats$ | async" (select)="goToChat($event)"></app-chats-list>
+┊  ┊31┊    <app-chats-list [items]="chats$ | async"
+┊  ┊32┊                    appSelectableList="both"
+┊  ┊33┊                    (single)="goToChat($event)" (multiple)="deleteChats($event)" (isSelecting)="isSelecting = $event">
+┊  ┊34┊      <app-confirm-selection #confirmSelection></app-confirm-selection>
+┊  ┊35┊    </app-chats-list>
 ┊32┊36┊
-┊33┊  ┊    <button class="chat-button" mat-fab color="primary">
+┊  ┊37┊    <button *ngIf="!isSelecting" class="chat-button" mat-fab color="primary">
 ┊34┊38┊      <mat-icon aria-label="Icon-button with a + icon">add</mat-icon>
 ┊35┊39┊    </button>
 ┊36┊40┊  `,
```
```diff
@@ -38,6 +42,7 @@
 ┊38┊42┊})
 ┊39┊43┊export class ChatsComponent implements OnInit {
 ┊40┊44┊  chats$: Observable<GetChats.Chats[]>;
+┊  ┊45┊  isSelecting = false;
 ┊41┊46┊
 ┊42┊47┊  constructor(private chatsService: ChatsService,
 ┊43┊48┊              private router: Router) {
```
```diff
@@ -50,4 +55,10 @@
 ┊50┊55┊  goToChat(chatId: string) {
 ┊51┊56┊    this.router.navigate(['/chat', chatId]);
 ┊52┊57┊  }
+┊  ┊58┊
+┊  ┊59┊  deleteChats(chatIds: string[]) {
+┊  ┊60┊    chatIds.forEach(chatId => {
+┊  ┊61┊      this.chatsService.removeChat(chatId).subscribe();
+┊  ┊62┊    });
+┊  ┊63┊  }
 ┊53┊64┊}
```

##### Added src&#x2F;app&#x2F;shared&#x2F;components&#x2F;confirm-selection&#x2F;confirm-selection.component.scss
```diff
@@ -0,0 +1,6 @@
+┊ ┊1┊:host {
+┊ ┊2┊  display: block;
+┊ ┊3┊  position: absolute;
+┊ ┊4┊  bottom: 5vw;
+┊ ┊5┊  right: 5vw;
+┊ ┊6┊}
```

##### Added src&#x2F;app&#x2F;shared&#x2F;components&#x2F;confirm-selection&#x2F;confirm-selection.component.ts
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊import {Component, EventEmitter, Input, Output} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-confirm-selection',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <button mat-fab color="primary" (click)="handleClick()">
+┊  ┊ 7┊      <mat-icon aria-label="Icon-button">{{ icon }}</mat-icon>
+┊  ┊ 8┊    </button>
+┊  ┊ 9┊  `,
+┊  ┊10┊  styleUrls: ['./confirm-selection.component.scss'],
+┊  ┊11┊})
+┊  ┊12┊export class ConfirmSelectionComponent {
+┊  ┊13┊  @Input()
+┊  ┊14┊  icon = 'delete';
+┊  ┊15┊  @Output()
+┊  ┊16┊  emitClick = new EventEmitter<null>();
+┊  ┊17┊
+┊  ┊18┊  handleClick() {
+┊  ┊19┊    this.emitClick.emit();
+┊  ┊20┊  }
+┊  ┊21┊}
```

##### Changed src&#x2F;app&#x2F;shared&#x2F;shared.module.ts
```diff
@@ -1,19 +1,23 @@
 ┊ 1┊ 1┊import {BrowserModule} from '@angular/platform-browser';
 ┊ 2┊ 2┊import {NgModule} from '@angular/core';
 ┊ 3┊ 3┊
-┊ 4┊  ┊import {MatToolbarModule} from '@angular/material';
+┊  ┊ 4┊import {MatButtonModule, MatIconModule, MatToolbarModule} from '@angular/material';
 ┊ 5┊ 5┊import {ToolbarComponent} from './components/toolbar/toolbar.component';
 ┊ 6┊ 6┊import {FormsModule} from '@angular/forms';
 ┊ 7┊ 7┊import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
+┊  ┊ 8┊import {ConfirmSelectionComponent} from './components/confirm-selection/confirm-selection.component';
 ┊ 8┊ 9┊
 ┊ 9┊10┊@NgModule({
 ┊10┊11┊  declarations: [
 ┊11┊12┊    ToolbarComponent,
+┊  ┊13┊    ConfirmSelectionComponent,
 ┊12┊14┊  ],
 ┊13┊15┊  imports: [
 ┊14┊16┊    BrowserModule,
 ┊15┊17┊    // Material
 ┊16┊18┊    MatToolbarModule,
+┊  ┊19┊    MatIconModule,
+┊  ┊20┊    MatButtonModule,
 ┊17┊21┊    // Animations
 ┊18┊22┊    BrowserAnimationsModule,
 ┊19┊23┊    // Forms
```
```diff
@@ -22,6 +26,7 @@
 ┊22┊26┊  providers: [],
 ┊23┊27┊  exports: [
 ┊24┊28┊    ToolbarComponent,
+┊  ┊29┊    ConfirmSelectionComponent,
 ┊25┊30┊  ],
 ┊26┊31┊})
 ┊27┊32┊export class SharedModule {
```

[}]: #

We also created a `ConfirmSelectionComponent` to use for content projection, since our selectable list directive will be able to listen to its events.
The selectable list directive supports much more different use cases, for info please read the documentation.

# Chapter 12

We still cannot create new chats or groups, so let's implement it.
We're going to create a `ChatsCreation` module, with a `NewChat` and a `NewGroup` containers, along with several presentational components.
We're going to make use of the selectable list directive once again, to ease selecting the users when we're creating a new group.
You should also notice that we are looking for existing chats before creating a new one: if it already exists we're are simply redirecting to that chat instead of creating a new one (the server wouldn't allow that anyway and it will simply 
return the chat id).

[{]: <helper> (diffStep "8.1")

#### Step 8.1: New chats and groups

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊import {ChatsListerModule} from './chats-lister/chats-lister.module';
 ┊11┊11┊import {RouterModule, Routes} from '@angular/router';
 ┊12┊12┊import {ChatViewerModule} from './chat-viewer/chat-viewer.module';
+┊  ┊13┊import {ChatsCreationModule} from './chats-creation/chats-creation.module';
 ┊13┊14┊
 ┊14┊15┊const routes: Routes = [
 ┊15┊16┊  {path: '', redirectTo: 'chats', pathMatch: 'full'},
```
```diff
@@ -30,6 +31,7 @@
 ┊30┊31┊    // Feature modules
 ┊31┊32┊    ChatsListerModule,
 ┊32┊33┊    ChatViewerModule,
+┊  ┊34┊    ChatsCreationModule,
 ┊33┊35┊  ],
 ┊34┊36┊  providers: [],
 ┊35┊37┊  bootstrap: [AppComponent]
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.spec.ts
```diff
@@ -113,7 +113,8 @@
 ┊113┊113┊    fixture = TestBed.createComponent(ChatComponent);
 ┊114┊114┊    component = fixture.componentInstance;
 ┊115┊115┊    fixture.detectChanges();
-┊116┊   ┊    const req = httpMock.expectOne('http://localhost:3000/graphql', 'call to api');
+┊   ┊116┊    httpMock.expectOne(httpReq => httpReq.body.operationName === 'GetChats', 'call to getChats api');
+┊   ┊117┊    const req = httpMock.expectOne(httpReq => httpReq.body.operationName === 'GetChat', 'call to getChat api');
 ┊117┊118┊    req.flush({
 ┊118┊119┊      data: {
 ┊119┊120┊        chat
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;chats-creation.module.ts
```diff
@@ -0,0 +1,60 @@
+┊  ┊ 1┊import { BrowserModule } from '@angular/platform-browser';
+┊  ┊ 2┊import { NgModule } from '@angular/core';
+┊  ┊ 3┊
+┊  ┊ 4┊import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
+┊  ┊ 5┊import {
+┊  ┊ 6┊  MatButtonModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule,
+┊  ┊ 7┊  MatToolbarModule
+┊  ┊ 8┊} from '@angular/material';
+┊  ┊ 9┊import {RouterModule, Routes} from '@angular/router';
+┊  ┊10┊import {FormsModule} from '@angular/forms';
+┊  ┊11┊import {ChatsService} from '../services/chats.service';
+┊  ┊12┊import {UserItemComponent} from './components/user-item/user-item.component';
+┊  ┊13┊import {UsersListComponent} from './components/users-list/users-list.component';
+┊  ┊14┊import {NewGroupComponent} from './containers/new-group/new-group.component';
+┊  ┊15┊import {NewChatComponent} from './containers/new-chat/new-chat.component';
+┊  ┊16┊import {NewGroupDetailsComponent} from './components/new-group-details/new-group-details.component';
+┊  ┊17┊import {SharedModule} from '../shared/shared.module';
+┊  ┊18┊import {SelectableListModule} from 'ngx-selectable-list';
+┊  ┊19┊
+┊  ┊20┊const routes: Routes = [
+┊  ┊21┊  {path: 'new-chat', component: NewChatComponent},
+┊  ┊22┊  {path: 'new-group', component: NewGroupComponent},
+┊  ┊23┊];
+┊  ┊24┊
+┊  ┊25┊@NgModule({
+┊  ┊26┊  declarations: [
+┊  ┊27┊    NewChatComponent,
+┊  ┊28┊    UsersListComponent,
+┊  ┊29┊    NewGroupComponent,
+┊  ┊30┊    UserItemComponent,
+┊  ┊31┊    NewGroupDetailsComponent,
+┊  ┊32┊  ],
+┊  ┊33┊  imports: [
+┊  ┊34┊    BrowserModule,
+┊  ┊35┊    // Animations (for Material)
+┊  ┊36┊    BrowserAnimationsModule,
+┊  ┊37┊    // Material
+┊  ┊38┊    MatToolbarModule,
+┊  ┊39┊    MatMenuModule,
+┊  ┊40┊    MatIconModule,
+┊  ┊41┊    MatButtonModule,
+┊  ┊42┊    MatListModule,
+┊  ┊43┊    MatGridListModule,
+┊  ┊44┊    MatInputModule,
+┊  ┊45┊    MatFormFieldModule,
+┊  ┊46┊    MatGridListModule,
+┊  ┊47┊    // Routing
+┊  ┊48┊    RouterModule.forChild(routes),
+┊  ┊49┊    // Forms
+┊  ┊50┊    FormsModule,
+┊  ┊51┊    // Feature modules
+┊  ┊52┊    SelectableListModule,
+┊  ┊53┊    SharedModule,
+┊  ┊54┊  ],
+┊  ┊55┊  providers: [
+┊  ┊56┊    ChatsService,
+┊  ┊57┊  ],
+┊  ┊58┊})
+┊  ┊59┊export class ChatsCreationModule {
+┊  ┊60┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;new-group-details&#x2F;new-group-details.component.scss
```diff
@@ -0,0 +1,25 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: block;
+┊  ┊ 3┊}
+┊  ┊ 4┊
+┊  ┊ 5┊div {
+┊  ┊ 6┊  padding: 16px;
+┊  ┊ 7┊  mat-form-field {
+┊  ┊ 8┊    width: 100%;
+┊  ┊ 9┊  }
+┊  ┊10┊}
+┊  ┊11┊
+┊  ┊12┊.new-group {
+┊  ┊13┊  position: absolute;
+┊  ┊14┊  bottom: 5vw;
+┊  ┊15┊  right: 5vw;
+┊  ┊16┊}
+┊  ┊17┊
+┊  ┊18┊.users {
+┊  ┊19┊  display: flex;
+┊  ┊20┊  flex-flow: row wrap;
+┊  ┊21┊  img {
+┊  ┊22┊    flex: 0 1 8vh;
+┊  ┊23┊    height: 8vh;
+┊  ┊24┊  }
+┊  ┊25┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;new-group-details&#x2F;new-group-details.component.ts
```diff
@@ -0,0 +1,34 @@
+┊  ┊ 1┊import {Component, EventEmitter, Input, Output} from '@angular/core';
+┊  ┊ 2┊import {GetUsers} from '../../../../types';
+┊  ┊ 3┊
+┊  ┊ 4┊@Component({
+┊  ┊ 5┊  selector: 'app-new-group-details',
+┊  ┊ 6┊  template: `
+┊  ┊ 7┊    <div>
+┊  ┊ 8┊      <mat-form-field>
+┊  ┊ 9┊        <input matInput placeholder="Group name" [(ngModel)]="groupName">
+┊  ┊10┊      </mat-form-field>
+┊  ┊11┊    </div>
+┊  ┊12┊    <button [disabled]="!groupName" class="new-group" mat-fab color="primary" (click)="emitGroupDetails()">
+┊  ┊13┊      <mat-icon aria-label="Icon-button with a + icon">arrow_forward</mat-icon>
+┊  ┊14┊    </button>
+┊  ┊15┊    <div>Members</div>
+┊  ┊16┊    <div class="users">
+┊  ┊17┊      <img *ngFor="let user of users;" [src]="user.picture"/>
+┊  ┊18┊    </div>
+┊  ┊19┊  `,
+┊  ┊20┊  styleUrls: ['new-group-details.component.scss'],
+┊  ┊21┊})
+┊  ┊22┊export class NewGroupDetailsComponent {
+┊  ┊23┊  groupName: string;
+┊  ┊24┊  @Input()
+┊  ┊25┊  users: GetUsers.Users[];
+┊  ┊26┊  @Output()
+┊  ┊27┊  groupDetails = new EventEmitter<string>();
+┊  ┊28┊
+┊  ┊29┊  emitGroupDetails() {
+┊  ┊30┊    if (this.groupDetails) {
+┊  ┊31┊      this.groupDetails.emit(this.groupName);
+┊  ┊32┊    }
+┊  ┊33┊  }
+┊  ┊34┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;user-item&#x2F;user-item.component.scss
```diff
@@ -0,0 +1,28 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: block;
+┊  ┊ 3┊  width: 100%;
+┊  ┊ 4┊  height: 100%;
+┊  ┊ 5┊}
+┊  ┊ 6┊
+┊  ┊ 7┊button {
+┊  ┊ 8┊  padding: 0;
+┊  ┊ 9┊  display: flex;
+┊  ┊10┊  align-items: center;
+┊  ┊11┊  height: 100%;
+┊  ┊12┊  width: 100%;
+┊  ┊13┊  border: none;
+┊  ┊14┊
+┊  ┊15┊  div:first-of-type {
+┊  ┊16┊    display: flex;
+┊  ┊17┊    justify-content: center;
+┊  ┊18┊    align-items: center;
+┊  ┊19┊
+┊  ┊20┊    img {
+┊  ┊21┊      max-width: 100%;
+┊  ┊22┊    }
+┊  ┊23┊  }
+┊  ┊24┊
+┊  ┊25┊  div:nth-of-type(2) {
+┊  ┊26┊    padding-left: 16px;
+┊  ┊27┊  }
+┊  ┊28┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;user-item&#x2F;user-item.component.ts
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊import {GetUsers} from '../../../../types';
+┊  ┊ 3┊
+┊  ┊ 4┊@Component({
+┊  ┊ 5┊  selector: 'app-user-item',
+┊  ┊ 6┊  template: `
+┊  ┊ 7┊    <button mat-menu-item>
+┊  ┊ 8┊      <div>
+┊  ┊ 9┊        <img [src]="user.picture" *ngIf="user.picture">
+┊  ┊10┊      </div>
+┊  ┊11┊      <div>{{ user.name }}</div>
+┊  ┊12┊    </button>
+┊  ┊13┊  `,
+┊  ┊14┊  styleUrls: ['user-item.component.scss']
+┊  ┊15┊})
+┊  ┊16┊export class UserItemComponent {
+┊  ┊17┊  // tslint:disable-next-line:no-input-rename
+┊  ┊18┊  @Input('item')
+┊  ┊19┊  user: GetUsers.Users;
+┊  ┊20┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;users-list&#x2F;users-list.component.scss
```diff
@@ -0,0 +1,3 @@
+┊ ┊1┊:host {
+┊ ┊2┊  display: block;
+┊ ┊3┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;users-list&#x2F;users-list.component.ts
```diff
@@ -0,0 +1,24 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊import {GetUsers} from '../../../../types';
+┊  ┊ 3┊import {SelectableListDirective} from 'ngx-selectable-list';
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  selector: 'app-users-list',
+┊  ┊ 7┊  template: `
+┊  ┊ 8┊    <mat-list>
+┊  ┊ 9┊      <mat-list-item *ngFor="let user of users">
+┊  ┊10┊        <app-user-item [item]="user"
+┊  ┊11┊                       appSelectableItem></app-user-item>
+┊  ┊12┊      </mat-list-item>
+┊  ┊13┊    </mat-list>
+┊  ┊14┊    <ng-content *ngIf="selectableListDirective.selecting"></ng-content>
+┊  ┊15┊  `,
+┊  ┊16┊  styleUrls: ['users-list.component.scss'],
+┊  ┊17┊})
+┊  ┊18┊export class UsersListComponent {
+┊  ┊19┊  // tslint:disable-next-line:no-input-rename
+┊  ┊20┊  @Input('items')
+┊  ┊21┊  users: GetUsers.Users[];
+┊  ┊22┊
+┊  ┊23┊  constructor(public selectableListDirective: SelectableListDirective) {}
+┊  ┊24┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-chat&#x2F;new-chat.component.scss
```diff
@@ -0,0 +1,23 @@
+┊  ┊ 1┊.new-group {
+┊  ┊ 2┊  display: flex;
+┊  ┊ 3┊  height: 8vh;
+┊  ┊ 4┊  align-items: center;
+┊  ┊ 5┊
+┊  ┊ 6┊  div:first-of-type {
+┊  ┊ 7┊    height: 8vh;
+┊  ┊ 8┊    width: 8vh;
+┊  ┊ 9┊    display: flex;
+┊  ┊10┊    justify-content: center;
+┊  ┊11┊    align-items: center;
+┊  ┊12┊
+┊  ┊13┊    mat-icon {
+┊  ┊14┊      height: 5vh;
+┊  ┊15┊      width: 5vh;
+┊  ┊16┊      font-size: 5vh;
+┊  ┊17┊    }
+┊  ┊18┊  }
+┊  ┊19┊
+┊  ┊20┊  div:nth-of-type(2) {
+┊  ┊21┊    padding: 16px;
+┊  ┊22┊  }
+┊  ┊23┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-chat&#x2F;new-chat.component.ts
```diff
@@ -0,0 +1,59 @@
+┊  ┊ 1┊import {Component, OnInit} from '@angular/core';
+┊  ┊ 2┊import {Location} from '@angular/common';
+┊  ┊ 3┊import {Router} from '@angular/router';
+┊  ┊ 4┊import {AddChat, GetUsers} from '../../../../types';
+┊  ┊ 5┊import {ChatsService} from '../../../services/chats.service';
+┊  ┊ 6┊
+┊  ┊ 7┊@Component({
+┊  ┊ 8┊  template: `
+┊  ┊ 9┊    <app-toolbar>
+┊  ┊10┊      <button class="navigation" mat-button (click)="goBack()">
+┊  ┊11┊        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
+┊  ┊12┊      </button>
+┊  ┊13┊      <div class="title">New chat</div>
+┊  ┊14┊    </app-toolbar>
+┊  ┊15┊
+┊  ┊16┊    <div class="new-group" (click)="goToNewGroup()">
+┊  ┊17┊      <div>
+┊  ┊18┊        <mat-icon aria-label="Icon-button with a group add icon">group_add</mat-icon>
+┊  ┊19┊      </div>
+┊  ┊20┊      <div>New group</div>
+┊  ┊21┊    </div>
+┊  ┊22┊
+┊  ┊23┊    <app-users-list [items]="users"
+┊  ┊24┊                    appSelectableList="single" (single)="addChat($event)">
+┊  ┊25┊    </app-users-list>
+┊  ┊26┊  `,
+┊  ┊27┊  styleUrls: ['new-chat.component.scss'],
+┊  ┊28┊})
+┊  ┊29┊export class NewChatComponent implements OnInit {
+┊  ┊30┊  users: GetUsers.Users[];
+┊  ┊31┊
+┊  ┊32┊  constructor(private router: Router,
+┊  ┊33┊              private location: Location,
+┊  ┊34┊              private chatsService: ChatsService) {}
+┊  ┊35┊
+┊  ┊36┊  ngOnInit () {
+┊  ┊37┊    this.chatsService.getUsers().users$.subscribe(users => this.users = users);
+┊  ┊38┊  }
+┊  ┊39┊
+┊  ┊40┊  goBack() {
+┊  ┊41┊    this.location.back();
+┊  ┊42┊  }
+┊  ┊43┊
+┊  ┊44┊  goToNewGroup() {
+┊  ┊45┊    this.router.navigate(['/new-group']);
+┊  ┊46┊  }
+┊  ┊47┊
+┊  ┊48┊  addChat(recipientId: string) {
+┊  ┊49┊    const chatId = this.chatsService.getChatId(recipientId);
+┊  ┊50┊    if (chatId) {
+┊  ┊51┊      // Chat is already listed for the current user
+┊  ┊52┊      this.router.navigate(['/chat', chatId]);
+┊  ┊53┊    } else {
+┊  ┊54┊      this.chatsService.addChat(recipientId).subscribe(({data: {addChat: {id}}}: { data: AddChat.Mutation }) => {
+┊  ┊55┊        this.router.navigate(['/chat', id]);
+┊  ┊56┊      });
+┊  ┊57┊    }
+┊  ┊58┊  }
+┊  ┊59┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-group&#x2F;new-group.component.scss


##### Added src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-group&#x2F;new-group.component.ts
```diff
@@ -0,0 +1,60 @@
+┊  ┊ 1┊import {Component, OnInit} from '@angular/core';
+┊  ┊ 2┊import {Location} from '@angular/common';
+┊  ┊ 3┊import {Router} from '@angular/router';
+┊  ┊ 4┊import {AddGroup, GetUsers} from '../../../../types';
+┊  ┊ 5┊import {ChatsService} from '../../../services/chats.service';
+┊  ┊ 6┊
+┊  ┊ 7┊@Component({
+┊  ┊ 8┊  template: `
+┊  ┊ 9┊    <app-toolbar>
+┊  ┊10┊      <button class="navigation" mat-button (click)="goBack()">
+┊  ┊11┊        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
+┊  ┊12┊      </button>
+┊  ┊13┊      <div class="title">New group</div>
+┊  ┊14┊    </app-toolbar>
+┊  ┊15┊
+┊  ┊16┊    <app-users-list *ngIf="!recipientIds.length" [items]="users"
+┊  ┊17┊                    appSelectableList="multiple_tap" (multiple)="selectUsers($event)">
+┊  ┊18┊      <app-confirm-selection #confirmSelection icon="arrow_forward"></app-confirm-selection>
+┊  ┊19┊    </app-users-list>
+┊  ┊20┊    <app-new-group-details *ngIf="recipientIds.length" [users]="getSelectedUsers()"
+┊  ┊21┊                           (groupDetails)="addGroup($event)"></app-new-group-details>
+┊  ┊22┊  `,
+┊  ┊23┊  styleUrls: ['new-group.component.scss'],
+┊  ┊24┊})
+┊  ┊25┊export class NewGroupComponent implements OnInit {
+┊  ┊26┊  users: GetUsers.Users[];
+┊  ┊27┊  recipientIds: string[] = [];
+┊  ┊28┊
+┊  ┊29┊  constructor(private router: Router,
+┊  ┊30┊              private location: Location,
+┊  ┊31┊              private chatsService: ChatsService) {}
+┊  ┊32┊
+┊  ┊33┊  ngOnInit () {
+┊  ┊34┊    this.chatsService.getUsers().users$.subscribe(users => this.users = users);
+┊  ┊35┊  }
+┊  ┊36┊
+┊  ┊37┊  goBack() {
+┊  ┊38┊    if (this.recipientIds.length) {
+┊  ┊39┊      this.recipientIds = [];
+┊  ┊40┊    } else {
+┊  ┊41┊      this.location.back();
+┊  ┊42┊    }
+┊  ┊43┊  }
+┊  ┊44┊
+┊  ┊45┊  selectUsers(recipientIds: string[]) {
+┊  ┊46┊    this.recipientIds = recipientIds;
+┊  ┊47┊  }
+┊  ┊48┊
+┊  ┊49┊  getSelectedUsers() {
+┊  ┊50┊    return this.users.filter(user => this.recipientIds.includes(user.id));
+┊  ┊51┊  }
+┊  ┊52┊
+┊  ┊53┊  addGroup(groupName: string) {
+┊  ┊54┊    if (groupName && this.recipientIds.length) {
+┊  ┊55┊      this.chatsService.addGroup(this.recipientIds, groupName).subscribe(({data: {addGroup: {id}}}: { data: AddGroup.Mutation }) => {
+┊  ┊56┊        this.router.navigate(['/chat', id]);
+┊  ┊57┊      });
+┊  ┊58┊    }
+┊  ┊59┊  }
+┊  ┊60┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.ts
```diff
@@ -34,7 +34,7 @@
 ┊34┊34┊      <app-confirm-selection #confirmSelection></app-confirm-selection>
 ┊35┊35┊    </app-chats-list>
 ┊36┊36┊
-┊37┊  ┊    <button *ngIf="!isSelecting" class="chat-button" mat-fab color="primary">
+┊  ┊37┊    <button *ngIf="!isSelecting" class="chat-button" mat-fab color="primary" (click)="goToNewChat()">
 ┊38┊38┊      <mat-icon aria-label="Icon-button with a + icon">add</mat-icon>
 ┊39┊39┊    </button>
 ┊40┊40┊  `,
```
```diff
@@ -56,6 +56,10 @@
 ┊56┊56┊    this.router.navigate(['/chat', chatId]);
 ┊57┊57┊  }
 ┊58┊58┊
+┊  ┊59┊  goToNewChat() {
+┊  ┊60┊    this.router.navigate(['/new-chat']);
+┊  ┊61┊  }
+┊  ┊62┊
 ┊59┊63┊  deleteChats(chatIds: string[]) {
 ┊60┊64┊    chatIds.forEach(chatId => {
 ┊61┊65┊      this.chatsService.removeChat(chatId).subscribe();
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -1,30 +1,40 @@
 ┊ 1┊ 1┊import {ApolloQueryResult} from 'apollo-client';
 ┊ 2┊ 2┊import {map} from 'rxjs/operators';
-┊ 3┊  ┊import {Apollo} from 'apollo-angular';
+┊  ┊ 3┊import {Apollo, QueryRef} from 'apollo-angular';
 ┊ 4┊ 4┊import {Injectable} from '@angular/core';
 ┊ 5┊ 5┊import {getChatsQuery} from '../../graphql/getChats.query';
-┊ 6┊  ┊import {AddMessage, GetChat, GetChats, RemoveAllMessages, RemoveChat, RemoveMessages} from '../../types';
+┊  ┊ 6┊import {AddChat, AddGroup, AddMessage, GetChat, GetChats, GetUsers, RemoveAllMessages, RemoveChat, RemoveMessages} from '../../types';
 ┊ 7┊ 7┊import {getChatQuery} from '../../graphql/getChat.query';
 ┊ 8┊ 8┊import {addMessageMutation} from '../../graphql/addMessage.mutation';
 ┊ 9┊ 9┊import {removeChatMutation} from '../../graphql/removeChat.mutation';
 ┊10┊10┊import {DocumentNode} from 'graphql';
 ┊11┊11┊import {removeAllMessagesMutation} from '../../graphql/removeAllMessages.mutation';
 ┊12┊12┊import {removeMessagesMutation} from '../../graphql/removeMessages.mutation';
+┊  ┊13┊import {getUsersQuery} from '../../graphql/getUsers.query';
+┊  ┊14┊import {Observable} from 'rxjs/Observable';
+┊  ┊15┊import {addChatMutation} from '../../graphql/addChat.mutation';
+┊  ┊16┊import {addGroupMutation} from '../../graphql/addGroup.mutation';
+┊  ┊17┊
+┊  ┊18┊const currentUserId = '1';
 ┊13┊19┊
 ┊14┊20┊@Injectable()
 ┊15┊21┊export class ChatsService {
+┊  ┊22┊  getChatsWq: QueryRef<GetChats.Query>;
+┊  ┊23┊  chats$: Observable<GetChats.Chats[]>;
+┊  ┊24┊  chats: GetChats.Chats[];
 ┊16┊25┊
-┊17┊  ┊  constructor(private apollo: Apollo) {}
-┊18┊  ┊
-┊19┊  ┊  getChats() {
-┊20┊  ┊    const query = this.apollo.watchQuery<GetChats.Query>({
+┊  ┊26┊  constructor(private apollo: Apollo) {
+┊  ┊27┊    this.getChatsWq = this.apollo.watchQuery<GetChats.Query>({
 ┊21┊28┊      query: getChatsQuery
 ┊22┊29┊    });
-┊23┊  ┊    const chats$ = query.valueChanges.pipe(
+┊  ┊30┊    this.chats$ = this.getChatsWq.valueChanges.pipe(
 ┊24┊31┊      map((result: ApolloQueryResult<GetChats.Query>) => result.data.chats)
 ┊25┊32┊    );
+┊  ┊33┊    this.chats$.subscribe(chats => this.chats = chats);
+┊  ┊34┊  }
 ┊26┊35┊
-┊27┊  ┊    return {query, chats$};
+┊  ┊36┊  getChats() {
+┊  ┊37┊    return {query: this.getChatsWq, chats$: this.chats$};
 ┊28┊38┊  }
 ┊29┊39┊
 ┊30┊40┊  getChat(chatId: string) {
```
```diff
@@ -149,4 +159,58 @@
 ┊149┊159┊      },
 ┊150┊160┊    });
 ┊151┊161┊  }
+┊   ┊162┊
+┊   ┊163┊  getUsers() {
+┊   ┊164┊    const query = this.apollo.watchQuery<GetUsers.Query>({
+┊   ┊165┊      query: getUsersQuery,
+┊   ┊166┊    });
+┊   ┊167┊    const users$ = query.valueChanges.pipe(
+┊   ┊168┊      map((result: ApolloQueryResult<GetUsers.Query>) => result.data.users)
+┊   ┊169┊    );
+┊   ┊170┊
+┊   ┊171┊    return {query, users$};
+┊   ┊172┊  }
+┊   ┊173┊
+┊   ┊174┊  // Checks if the chat is listed for the current user and returns the id
+┊   ┊175┊  getChatId(recipientId: string) {
+┊   ┊176┊    const _chat = this.chats.find(chat => {
+┊   ┊177┊      return !chat.isGroup && chat.userIds.includes(currentUserId) && chat.userIds.includes(recipientId);
+┊   ┊178┊    });
+┊   ┊179┊    return _chat ? _chat.id : false;
+┊   ┊180┊  }
+┊   ┊181┊
+┊   ┊182┊  addChat(recipientId: string) {
+┊   ┊183┊    return this.apollo.mutate({
+┊   ┊184┊      mutation: addChatMutation,
+┊   ┊185┊      variables: <AddChat.Variables>{
+┊   ┊186┊        recipientId,
+┊   ┊187┊      },
+┊   ┊188┊      update: (store, { data: { addChat } }) => {
+┊   ┊189┊        // Read the data from our cache for this query.
+┊   ┊190┊        const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
+┊   ┊191┊        // Add our comment from the mutation to the end.
+┊   ┊192┊        chats.push(addChat);
+┊   ┊193┊        // Write our data back to the cache.
+┊   ┊194┊        store.writeQuery({ query: getChatsQuery, data: {chats} });
+┊   ┊195┊      },
+┊   ┊196┊    });
+┊   ┊197┊  }
+┊   ┊198┊
+┊   ┊199┊  addGroup(recipientIds: string[], groupName: string) {
+┊   ┊200┊    return this.apollo.mutate({
+┊   ┊201┊      mutation: addGroupMutation,
+┊   ┊202┊      variables: <AddGroup.Variables>{
+┊   ┊203┊        recipientIds,
+┊   ┊204┊        groupName,
+┊   ┊205┊      },
+┊   ┊206┊      update: (store, { data: { addGroup } }) => {
+┊   ┊207┊        // Read the data from our cache for this query.
+┊   ┊208┊        const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
+┊   ┊209┊        // Add our comment from the mutation to the end.
+┊   ┊210┊        chats.push(addGroup);
+┊   ┊211┊        // Write our data back to the cache.
+┊   ┊212┊        store.writeQuery({ query: getChatsQuery, data: {chats} });
+┊   ┊213┊      },
+┊   ┊214┊    });
+┊   ┊215┊  }
 ┊152┊216┊}
```

##### Added src&#x2F;graphql&#x2F;addChat.mutation.ts
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊
+┊  ┊ 3┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 4┊export const addChatMutation = gql`
+┊  ┊ 5┊  mutation AddChat($recipientId: ID!) {
+┊  ┊ 6┊    addChat(recipientId: $recipientId) {
+┊  ┊ 7┊      id,
+┊  ┊ 8┊      __typename,
+┊  ┊ 9┊      name,
+┊  ┊10┊      picture,
+┊  ┊11┊      userIds,
+┊  ┊12┊      unreadMessages,
+┊  ┊13┊      lastMessage {
+┊  ┊14┊        id,
+┊  ┊15┊        __typename,
+┊  ┊16┊        content,
+┊  ┊17┊      },
+┊  ┊18┊      isGroup,
+┊  ┊19┊    }
+┊  ┊20┊  }
+┊  ┊21┊`;
```

##### Added src&#x2F;graphql&#x2F;addGroup.mutation.ts
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊
+┊  ┊ 3┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 4┊export const addGroupMutation = gql`
+┊  ┊ 5┊  mutation AddGroup($recipientIds: [ID!]!, $groupName: String!) {
+┊  ┊ 6┊    addGroup(recipientIds: $recipientIds, groupName: $groupName) {
+┊  ┊ 7┊      id,
+┊  ┊ 8┊      __typename,
+┊  ┊ 9┊      name,
+┊  ┊10┊      picture,
+┊  ┊11┊      userIds,
+┊  ┊12┊      unreadMessages,
+┊  ┊13┊      lastMessage {
+┊  ┊14┊        id,
+┊  ┊15┊        __typename,
+┊  ┊16┊        content,
+┊  ┊17┊      },
+┊  ┊18┊      isGroup,
+┊  ┊19┊    }
+┊  ┊20┊  }
+┊  ┊21┊`;
```

##### Added src&#x2F;graphql&#x2F;getUsers.query.ts
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊
+┊  ┊ 3┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 4┊export const getUsersQuery = gql`
+┊  ┊ 5┊  query GetUsers {
+┊  ┊ 6┊    users {
+┊  ┊ 7┊      id,
+┊  ┊ 8┊      __typename,
+┊  ┊ 9┊      name,
+┊  ┊10┊      picture,
+┊  ┊11┊    }
+┊  ┊12┊  }
+┊  ┊13┊`;
```

##### Changed src&#x2F;types.d.ts
```diff
@@ -114,6 +114,55 @@
 ┊114┊114┊
 ┊115┊115┊export type MessageType = "TEXT" | "LOCATION" | "PICTURE";
 ┊116┊116┊
+┊   ┊117┊export namespace AddChat {
+┊   ┊118┊  export type Variables = {
+┊   ┊119┊    recipientId: string;
+┊   ┊120┊  }
+┊   ┊121┊
+┊   ┊122┊  export type Mutation = {
+┊   ┊123┊    addChat?: AddChat | null; 
+┊   ┊124┊  } 
+┊   ┊125┊
+┊   ┊126┊  export type AddChat = {
+┊   ┊127┊    id: string; 
+┊   ┊128┊    name?: string | null; 
+┊   ┊129┊    picture?: string | null; 
+┊   ┊130┊    userIds: string[]; 
+┊   ┊131┊    unreadMessages: number; 
+┊   ┊132┊    lastMessage?: LastMessage | null; 
+┊   ┊133┊    isGroup: boolean; 
+┊   ┊134┊  } 
+┊   ┊135┊
+┊   ┊136┊  export type LastMessage = {
+┊   ┊137┊    id: string; 
+┊   ┊138┊    content: string; 
+┊   ┊139┊  } 
+┊   ┊140┊}
+┊   ┊141┊export namespace AddGroup {
+┊   ┊142┊  export type Variables = {
+┊   ┊143┊    recipientIds: string[];
+┊   ┊144┊    groupName: string;
+┊   ┊145┊  }
+┊   ┊146┊
+┊   ┊147┊  export type Mutation = {
+┊   ┊148┊    addGroup?: AddGroup | null; 
+┊   ┊149┊  } 
+┊   ┊150┊
+┊   ┊151┊  export type AddGroup = {
+┊   ┊152┊    id: string; 
+┊   ┊153┊    name?: string | null; 
+┊   ┊154┊    picture?: string | null; 
+┊   ┊155┊    userIds: string[]; 
+┊   ┊156┊    unreadMessages: number; 
+┊   ┊157┊    lastMessage?: LastMessage | null; 
+┊   ┊158┊    isGroup: boolean; 
+┊   ┊159┊  } 
+┊   ┊160┊
+┊   ┊161┊  export type LastMessage = {
+┊   ┊162┊    id: string; 
+┊   ┊163┊    content: string; 
+┊   ┊164┊  } 
+┊   ┊165┊}
 ┊117┊166┊export namespace AddMessage {
 ┊118┊167┊  export type Variables = {
 ┊119┊168┊    chatId: string;
```
```diff
@@ -225,6 +274,20 @@
 ┊225┊274┊    readAt?: number | null; 
 ┊226┊275┊  } 
 ┊227┊276┊}
+┊   ┊277┊export namespace GetUsers {
+┊   ┊278┊  export type Variables = {
+┊   ┊279┊  }
+┊   ┊280┊
+┊   ┊281┊  export type Query = {
+┊   ┊282┊    users: Users[]; 
+┊   ┊283┊  } 
+┊   ┊284┊
+┊   ┊285┊  export type Users = {
+┊   ┊286┊    id: string; 
+┊   ┊287┊    name?: string | null; 
+┊   ┊288┊    picture?: string | null; 
+┊   ┊289┊  } 
+┊   ┊290┊}
 ┊228┊291┊export namespace RemoveAllMessages {
 ┊229┊292┊  export type Variables = {
 ┊230┊293┊    chatId: string;
```

[}]: #

# Chapter 13

Now let's start our client in production mode:

    $ ng serve --prod

Now open the Chrome Developers Tools and, in the Network tab, select 'Slow 3G Network' and 'Disable cache'.
Now refresh the page and look at the DOMContentLoaded time and at the transferred size. You'll notice that our bundle size is quite small and so the loads time.
Now let's click on a specific chat. It will take some time to load the data. Now let's add a new message. Once again it will take some time to load the data. We could also create a new chat and the result would be the same. The whole app doesn't 
feel as snappier as the real Whatsapp on a slow 3G Network.
"That's normal, it's a web application with a remote db while Whatsapp is a native app with a local database..."
That's just an excuse, because we can do as good as Whatsapp thanks to Apollo!

Let's start by making our UI optimistic. We can predict most of the response we will get from our server, except for a few things like `id` of newly created messages. But since we don't really need that id, we can simply generate a fake one 
which will be later overridden once we get the response from the server:

[{]: <helper> (diffStep "9.1")

#### Step 9.1: Optimistic updates

##### Changed package.json
```diff
@@ -32,6 +32,7 @@
 ┊32┊32┊    "graphql": "0.12.3",
 ┊33┊33┊    "graphql-tag": "2.6.1",
 ┊34┊34┊    "hammerjs": "2.0.8",
+┊  ┊35┊    "moment": "2.20.1",
 ┊35┊36┊    "ng2-truncate": "1.3.11",
 ┊36┊37┊    "ngx-selectable-list": "1.1.0",
 ┊37┊38┊    "rxjs": "5.5.6",
```

##### Changed src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-chat&#x2F;new-chat.component.ts
```diff
@@ -51,7 +51,7 @@
 ┊51┊51┊      // Chat is already listed for the current user
 ┊52┊52┊      this.router.navigate(['/chat', chatId]);
 ┊53┊53┊    } else {
-┊54┊  ┊      this.chatsService.addChat(recipientId).subscribe(({data: {addChat: {id}}}: { data: AddChat.Mutation }) => {
+┊  ┊54┊      this.chatsService.addChat(recipientId, this.users).subscribe(({data: {addChat: {id}}}: { data: AddChat.Mutation }) => {
 ┊55┊55┊        this.router.navigate(['/chat', id]);
 ┊56┊56┊      });
 ┊57┊57┊    }
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -14,8 +14,10 @@
 ┊14┊14┊import {Observable} from 'rxjs/Observable';
 ┊15┊15┊import {addChatMutation} from '../../graphql/addChat.mutation';
 ┊16┊16┊import {addGroupMutation} from '../../graphql/addGroup.mutation';
+┊  ┊17┊import * as moment from 'moment';
 ┊17┊18┊
 ┊18┊19┊const currentUserId = '1';
+┊  ┊20┊const currentUserName = 'Ethan Gonzalez';
 ┊19┊21┊
 ┊20┊22┊@Injectable()
 ┊21┊23┊export class ChatsService {
```
```diff
@@ -33,6 +35,10 @@
 ┊33┊35┊    this.chats$.subscribe(chats => this.chats = chats);
 ┊34┊36┊  }
 ┊35┊37┊
+┊  ┊38┊  static getRandomId() {
+┊  ┊39┊    return String(Math.round(Math.random() * 1000000000000));
+┊  ┊40┊  }
+┊  ┊41┊
 ┊36┊42┊  getChats() {
 ┊37┊43┊    return {query: this.getChatsWq, chats$: this.chats$};
 ┊38┊44┊  }
```
```diff
@@ -59,6 +65,24 @@
 ┊59┊65┊        chatId,
 ┊60┊66┊        content,
 ┊61┊67┊      },
+┊  ┊68┊      optimisticResponse: {
+┊  ┊69┊        __typename: 'Mutation',
+┊  ┊70┊        addMessage: {
+┊  ┊71┊          id: ChatsService.getRandomId(),
+┊  ┊72┊          __typename: 'Message',
+┊  ┊73┊          senderId: currentUserId,
+┊  ┊74┊          sender: {
+┊  ┊75┊            id: currentUserId,
+┊  ┊76┊            __typename: 'User',
+┊  ┊77┊            name: currentUserName,
+┊  ┊78┊          },
+┊  ┊79┊          content,
+┊  ┊80┊          createdAt: moment().unix(),
+┊  ┊81┊          type: 0,
+┊  ┊82┊          recipients: [],
+┊  ┊83┊          ownership: true,
+┊  ┊84┊        },
+┊  ┊85┊      },
 ┊62┊86┊      update: (store, { data: { addMessage } }: {data: AddMessage.Mutation}) => {
 ┊63┊87┊        // Update the messages cache
 ┊64┊88┊        {
```
```diff
@@ -92,6 +116,10 @@
 ┊ 92┊116┊      variables: <RemoveChat.Variables>{
 ┊ 93┊117┊        chatId,
 ┊ 94┊118┊      },
+┊   ┊119┊      optimisticResponse: {
+┊   ┊120┊        __typename: 'Mutation',
+┊   ┊121┊        removeChat: chatId,
+┊   ┊122┊      },
 ┊ 95┊123┊      update: (store, { data: { removeChat } }) => {
 ┊ 96┊124┊        // Read the data from our cache for this query.
 ┊ 97┊125┊        const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
```
```diff
@@ -125,6 +153,10 @@
 ┊125┊153┊    return this.apollo.mutate({
 ┊126┊154┊      mutation,
 ┊127┊155┊      variables,
+┊   ┊156┊      optimisticResponse: {
+┊   ┊157┊        __typename: 'Mutation',
+┊   ┊158┊        removeMessages: ids,
+┊   ┊159┊      },
 ┊128┊160┊      update: (store, { data: { removeMessages } }: {data: RemoveMessages.Mutation | RemoveAllMessages.Mutation}) => {
 ┊129┊161┊        // Update the messages cache
 ┊130┊162┊        {
```
```diff
@@ -179,12 +211,25 @@
 ┊179┊211┊    return _chat ? _chat.id : false;
 ┊180┊212┊  }
 ┊181┊213┊
-┊182┊   ┊  addChat(recipientId: string) {
+┊   ┊214┊  addChat(recipientId: string, users: GetUsers.Users[]) {
 ┊183┊215┊    return this.apollo.mutate({
 ┊184┊216┊      mutation: addChatMutation,
 ┊185┊217┊      variables: <AddChat.Variables>{
 ┊186┊218┊        recipientId,
 ┊187┊219┊      },
+┊   ┊220┊      optimisticResponse: {
+┊   ┊221┊        __typename: 'Mutation',
+┊   ┊222┊        addChat: {
+┊   ┊223┊          id: ChatsService.getRandomId(),
+┊   ┊224┊          __typename: 'Chat',
+┊   ┊225┊          name: users.find(user => user.id === recipientId).name,
+┊   ┊226┊          picture: users.find(user => user.id === recipientId).picture,
+┊   ┊227┊          userIds: [currentUserId, recipientId],
+┊   ┊228┊          unreadMessages: 0,
+┊   ┊229┊          lastMessage: null,
+┊   ┊230┊          isGroup: false,
+┊   ┊231┊        },
+┊   ┊232┊      },
 ┊188┊233┊      update: (store, { data: { addChat } }) => {
 ┊189┊234┊        // Read the data from our cache for this query.
 ┊190┊235┊        const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
```
```diff
@@ -203,6 +248,19 @@
 ┊203┊248┊        recipientIds,
 ┊204┊249┊        groupName,
 ┊205┊250┊      },
+┊   ┊251┊      optimisticResponse: {
+┊   ┊252┊        __typename: 'Mutation',
+┊   ┊253┊        addGroup: {
+┊   ┊254┊          id: ChatsService.getRandomId(),
+┊   ┊255┊          __typename: 'Chat',
+┊   ┊256┊          name: groupName,
+┊   ┊257┊          picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊   ┊258┊          userIds: [currentUserId, recipientIds],
+┊   ┊259┊          unreadMessages: 0,
+┊   ┊260┊          lastMessage: null,
+┊   ┊261┊          isGroup: true,
+┊   ┊262┊        },
+┊   ┊263┊      },
 ┊206┊264┊      update: (store, { data: { addGroup } }) => {
 ┊207┊265┊        // Read the data from our cache for this query.
 ┊208┊266┊        const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
```

[}]: #

Now let's get the chat data from our chats cache while waiting for the server response. We will initially be able to show only the chat name, the last message and a few more informations instead of the whole content from the server, but that 
would be more than enough to entertain the user while waiting for the server's response:

[{]: <helper> (diffStep "9.2")

#### Step 9.2: Get chat data from chats cache while waiting for server response

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊import {ApolloQueryResult} from 'apollo-client';
-┊2┊ ┊import {map} from 'rxjs/operators';
+┊ ┊2┊import {concat, map} from 'rxjs/operators';
 ┊3┊3┊import {Apollo, QueryRef} from 'apollo-angular';
 ┊4┊4┊import {Injectable} from '@angular/core';
 ┊5┊5┊import {getChatsQuery} from '../../graphql/getChats.query';
```
```diff
@@ -15,6 +15,8 @@
 ┊15┊15┊import {addChatMutation} from '../../graphql/addChat.mutation';
 ┊16┊16┊import {addGroupMutation} from '../../graphql/addGroup.mutation';
 ┊17┊17┊import * as moment from 'moment';
+┊  ┊18┊import {AsyncSubject} from 'rxjs/AsyncSubject';
+┊  ┊19┊import {of} from 'rxjs/observable/of';
 ┊18┊20┊
 ┊19┊21┊const currentUserId = '1';
 ┊20┊22┊const currentUserName = 'Ethan Gonzalez';
```
```diff
@@ -24,6 +26,7 @@
 ┊24┊26┊  getChatsWq: QueryRef<GetChats.Query>;
 ┊25┊27┊  chats$: Observable<GetChats.Chats[]>;
 ┊26┊28┊  chats: GetChats.Chats[];
+┊  ┊29┊  getChatWqSubject: AsyncSubject<QueryRef<GetChat.Query>>;
 ┊27┊30┊
 ┊28┊31┊  constructor(private apollo: Apollo) {
 ┊29┊32┊    this.getChatsWq = this.apollo.watchQuery<GetChats.Query>({
```
```diff
@@ -44,18 +47,32 @@
 ┊44┊47┊  }
 ┊45┊48┊
 ┊46┊49┊  getChat(chatId: string) {
+┊  ┊50┊    const _chat = this.chats && this.chats.find(chat => chat.id === chatId) || null;
+┊  ┊51┊    const chat$FromCache = of<GetChat.Chat>({
+┊  ┊52┊      id: chatId,
+┊  ┊53┊      name: this.chats ? _chat.name : '',
+┊  ┊54┊      picture: this.chats ? _chat.picture : '',
+┊  ┊55┊      isGroup: this.chats ? _chat.isGroup : false,
+┊  ┊56┊      messages: this.chats && _chat.lastMessage ? [_chat.lastMessage] : [],
+┊  ┊57┊    });
+┊  ┊58┊
 ┊47┊59┊    const query = this.apollo.watchQuery<GetChat.Query>({
 ┊48┊60┊      query: getChatQuery,
 ┊49┊61┊      variables: {
-┊50┊  ┊        chatId: chatId,
+┊  ┊62┊        chatId,
 ┊51┊63┊      }
 ┊52┊64┊    });
 ┊53┊65┊
-┊54┊  ┊    const chat$ = query.valueChanges.pipe(
-┊55┊  ┊      map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
-┊56┊  ┊    );
+┊  ┊66┊    const chat$ = chat$FromCache.pipe(
+┊  ┊67┊      concat(query.valueChanges.pipe(
+┊  ┊68┊        map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
+┊  ┊69┊      )));
+┊  ┊70┊
+┊  ┊71┊    this.getChatWqSubject = new AsyncSubject();
+┊  ┊72┊    this.getChatWqSubject.next(query);
+┊  ┊73┊    this.getChatWqSubject.complete();
 ┊57┊74┊
-┊58┊  ┊    return {query, chat$};
+┊  ┊75┊    return {query$: this.getChatWqSubject.asObservable(), chat$};
 ┊59┊76┊  }
 ┊60┊77┊
 ┊61┊78┊  addMessage(chatId: string, content: string) {
```

[}]: #

Now let's deal with the most difficult part: how to deal with chats creation? Now we wouldn't be able to predict the `id` of the new chat and so we cannot navigate to the chat page because it contains the chat id in the url. We could simply 
navigate to the "optimistic" ui, but then the user wouldn't be able to navigate back to that url if he refreshes the page or bookmarks it. That's a problem we care about. How to solve it? We're going to create a landing page and we will later 
override the url once we get the response from the server!

[{]: <helper> (diffStep "9.3")

#### Step 9.3: Landing page for new chats/groups

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.spec.ts
```diff
@@ -92,7 +92,10 @@
 ┊ 92┊ 92┊        Apollo,
 ┊ 93┊ 93┊        {
 ┊ 94┊ 94┊          provide: ActivatedRoute,
-┊ 95┊   ┊          useValue: { params: of({ id: chat.id }) }
+┊   ┊ 95┊          useValue: {
+┊   ┊ 96┊            params: of({ id: chat.id }),
+┊   ┊ 97┊            queryParams: of({}),
+┊   ┊ 98┊          }
 ┊ 96┊ 99┊        }
 ┊ 97┊100┊      ],
 ┊ 98┊101┊      schemas: [NO_ERRORS_SCHEMA]
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.ts
```diff
@@ -2,6 +2,8 @@
 ┊2┊2┊import {ActivatedRoute, Router} from '@angular/router';
 ┊3┊3┊import {ChatsService} from '../../../services/chats.service';
 ┊4┊4┊import {GetChat} from '../../../../types';
+┊ ┊5┊import {combineLatest} from 'rxjs/observable/combineLatest';
+┊ ┊6┊import {Location} from '@angular/common';
 ┊5┊7┊
 ┊6┊8┊@Component({
 ┊7┊9┊  template: `
```
```diff
@@ -26,21 +28,40 @@
 ┊26┊28┊  messages: GetChat.Messages[];
 ┊27┊29┊  name: string;
 ┊28┊30┊  isGroup: boolean;
+┊  ┊31┊  optimisticUI: boolean;
 ┊29┊32┊
 ┊30┊33┊  constructor(private route: ActivatedRoute,
 ┊31┊34┊              private router: Router,
+┊  ┊35┊              private location: Location,
 ┊32┊36┊              private chatsService: ChatsService) {
 ┊33┊37┊  }
 ┊34┊38┊
 ┊35┊39┊  ngOnInit() {
-┊36┊  ┊    this.route.params.subscribe(({id: chatId}) => {
-┊37┊  ┊      this.chatId = chatId;
-┊38┊  ┊      this.chatsService.getChat(chatId).chat$.subscribe(chat => {
-┊39┊  ┊        this.messages = chat.messages;
-┊40┊  ┊        this.name = chat.name;
-┊41┊  ┊        this.isGroup = chat.isGroup;
+┊  ┊40┊    combineLatest(this.route.params, this.route.queryParams,
+┊  ┊41┊      (params: { id: string }, queryParams: { oui?: boolean }) => ({params, queryParams}))
+┊  ┊42┊      .subscribe(({params: {id: chatId}, queryParams: {oui}}) => {
+┊  ┊43┊        this.chatId = chatId;
+┊  ┊44┊
+┊  ┊45┊        this.optimisticUI = oui;
+┊  ┊46┊
+┊  ┊47┊        if (this.optimisticUI) {
+┊  ┊48┊          // We are using fake IDs generated by the Optimistic UI
+┊  ┊49┊          this.chatsService.addChat$.subscribe(({data: {addChat, addGroup}}) => {
+┊  ┊50┊            this.chatId = addChat ? addChat.id : addGroup.id;
+┊  ┊51┊            console.log(`Switching from the Optimistic UI id ${chatId} to ${this.chatId}`);
+┊  ┊52┊            // Rewrite the URL
+┊  ┊53┊            this.location.go(`chat/${this.chatId}`);
+┊  ┊54┊            // Optimistic UI no more
+┊  ┊55┊            this.optimisticUI = false;
+┊  ┊56┊          });
+┊  ┊57┊        }
+┊  ┊58┊
+┊  ┊59┊        this.chatsService.getChat(chatId, this.optimisticUI).chat$.subscribe(chat => {
+┊  ┊60┊          this.messages = chat.messages;
+┊  ┊61┊          this.name = chat.name;
+┊  ┊62┊          this.isGroup = chat.isGroup;
+┊  ┊63┊        });
 ┊42┊64┊      });
-┊43┊  ┊    });
 ┊44┊65┊  }
 ┊45┊66┊
 ┊46┊67┊  goToChats() {
```

##### Changed src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-chat&#x2F;new-chat.component.ts
```diff
@@ -51,9 +51,10 @@
 ┊51┊51┊      // Chat is already listed for the current user
 ┊52┊52┊      this.router.navigate(['/chat', chatId]);
 ┊53┊53┊    } else {
-┊54┊  ┊      this.chatsService.addChat(recipientId, this.users).subscribe(({data: {addChat: {id}}}: { data: AddChat.Mutation }) => {
-┊55┊  ┊        this.router.navigate(['/chat', id]);
-┊56┊  ┊      });
+┊  ┊54┊      // Generate id for Optimistic UI
+┊  ┊55┊      const ouiId = ChatsService.getRandomId();
+┊  ┊56┊      this.chatsService.addChat(recipientId, this.users, ouiId).subscribe();
+┊  ┊57┊      this.router.navigate(['/chat', ouiId], {queryParams: {oui: true}, skipLocationChange: true});
 ┊57┊58┊    }
 ┊58┊59┊  }
 ┊59┊60┊}
```

##### Changed src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-group&#x2F;new-group.component.ts
```diff
@@ -52,9 +52,9 @@
 ┊52┊52┊
 ┊53┊53┊  addGroup(groupName: string) {
 ┊54┊54┊    if (groupName && this.recipientIds.length) {
-┊55┊  ┊      this.chatsService.addGroup(this.recipientIds, groupName).subscribe(({data: {addGroup: {id}}}: { data: AddGroup.Mutation }) => {
-┊56┊  ┊        this.router.navigate(['/chat', id]);
-┊57┊  ┊      });
+┊  ┊55┊      const ouiId = ChatsService.getRandomId();
+┊  ┊56┊      this.chatsService.addGroup(this.recipientIds, groupName, ouiId).subscribe();
+┊  ┊57┊      this.router.navigate(['/chat', ouiId], {queryParams: {oui: true}, skipLocationChange: true});
 ┊58┊58┊    }
 ┊59┊59┊  }
 ┊60┊60┊}
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊import {ApolloQueryResult} from 'apollo-client';
-┊2┊ ┊import {concat, map} from 'rxjs/operators';
+┊ ┊2┊import {concat, map, share, switchMap} from 'rxjs/operators';
 ┊3┊3┊import {Apollo, QueryRef} from 'apollo-angular';
 ┊4┊4┊import {Injectable} from '@angular/core';
 ┊5┊5┊import {getChatsQuery} from '../../graphql/getChats.query';
```
```diff
@@ -17,6 +17,7 @@
 ┊17┊17┊import * as moment from 'moment';
 ┊18┊18┊import {AsyncSubject} from 'rxjs/AsyncSubject';
 ┊19┊19┊import {of} from 'rxjs/observable/of';
+┊  ┊20┊import {FetchResult} from 'apollo-link';
 ┊20┊21┊
 ┊21┊22┊const currentUserId = '1';
 ┊22┊23┊const currentUserName = 'Ethan Gonzalez';
```
```diff
@@ -27,6 +28,7 @@
 ┊27┊28┊  chats$: Observable<GetChats.Chats[]>;
 ┊28┊29┊  chats: GetChats.Chats[];
 ┊29┊30┊  getChatWqSubject: AsyncSubject<QueryRef<GetChat.Query>>;
+┊  ┊31┊  addChat$: Observable<FetchResult<AddChat.Mutation | AddGroup.Mutation>>;
 ┊30┊32┊
 ┊31┊33┊  constructor(private apollo: Apollo) {
 ┊32┊34┊    this.getChatsWq = this.apollo.watchQuery<GetChats.Query>({
```
```diff
@@ -46,7 +48,7 @@
 ┊46┊48┊    return {query: this.getChatsWq, chats$: this.chats$};
 ┊47┊49┊  }
 ┊48┊50┊
-┊49┊  ┊  getChat(chatId: string) {
+┊  ┊51┊  getChat(chatId: string, oui?: boolean) {
 ┊50┊52┊    const _chat = this.chats && this.chats.find(chat => chat.id === chatId) || null;
 ┊51┊53┊    const chat$FromCache = of<GetChat.Chat>({
 ┊52┊54┊      id: chatId,
```
```diff
@@ -56,21 +58,39 @@
 ┊56┊58┊      messages: this.chats && _chat.lastMessage ? [_chat.lastMessage] : [],
 ┊57┊59┊    });
 ┊58┊60┊
-┊59┊  ┊    const query = this.apollo.watchQuery<GetChat.Query>({
-┊60┊  ┊      query: getChatQuery,
-┊61┊  ┊      variables: {
-┊62┊  ┊        chatId,
-┊63┊  ┊      }
-┊64┊  ┊    });
-┊65┊  ┊
-┊66┊  ┊    const chat$ = chat$FromCache.pipe(
-┊67┊  ┊      concat(query.valueChanges.pipe(
-┊68┊  ┊        map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
-┊69┊  ┊      )));
+┊  ┊61┊    const getApolloWatchQuery = (id: string) => {
+┊  ┊62┊      return this.apollo.watchQuery<GetChat.Query>({
+┊  ┊63┊        query: getChatQuery,
+┊  ┊64┊        variables: {
+┊  ┊65┊          chatId: id,
+┊  ┊66┊        }
+┊  ┊67┊      });
+┊  ┊68┊    };
 ┊70┊69┊
+┊  ┊70┊    let chat$: Observable<GetChat.Chat>;
 ┊71┊71┊    this.getChatWqSubject = new AsyncSubject();
-┊72┊  ┊    this.getChatWqSubject.next(query);
-┊73┊  ┊    this.getChatWqSubject.complete();
+┊  ┊72┊
+┊  ┊73┊    if (oui) {
+┊  ┊74┊      chat$ = chat$FromCache.pipe(
+┊  ┊75┊        concat(this.addChat$.pipe(
+┊  ┊76┊          switchMap(({ data: { addChat, addGroup } }) => {
+┊  ┊77┊            const query = getApolloWatchQuery(addChat ? addChat.id : addGroup.id);
+┊  ┊78┊            this.getChatWqSubject.next(query);
+┊  ┊79┊            this.getChatWqSubject.complete();
+┊  ┊80┊            return query.valueChanges.pipe(
+┊  ┊81┊              map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
+┊  ┊82┊            );
+┊  ┊83┊          }))
+┊  ┊84┊        ));
+┊  ┊85┊    } else {
+┊  ┊86┊      const query = getApolloWatchQuery(chatId);
+┊  ┊87┊      this.getChatWqSubject.next(query);
+┊  ┊88┊      this.getChatWqSubject.complete();
+┊  ┊89┊      chat$ = chat$FromCache.pipe(
+┊  ┊90┊        concat(query.valueChanges.pipe(
+┊  ┊91┊          map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
+┊  ┊92┊        )));
+┊  ┊93┊    }
 ┊74┊94┊
 ┊75┊95┊    return {query$: this.getChatWqSubject.asObservable(), chat$};
 ┊76┊96┊  }
```
```diff
@@ -228,8 +248,8 @@
 ┊228┊248┊    return _chat ? _chat.id : false;
 ┊229┊249┊  }
 ┊230┊250┊
-┊231┊   ┊  addChat(recipientId: string, users: GetUsers.Users[]) {
-┊232┊   ┊    return this.apollo.mutate({
+┊   ┊251┊  addChat(recipientId: string, users: GetUsers.Users[], ouiId: string) {
+┊   ┊252┊    this.addChat$ = this.apollo.mutate({
 ┊233┊253┊      mutation: addChatMutation,
 ┊234┊254┊      variables: <AddChat.Variables>{
 ┊235┊255┊        recipientId,
```
```diff
@@ -237,7 +257,7 @@
 ┊237┊257┊      optimisticResponse: {
 ┊238┊258┊        __typename: 'Mutation',
 ┊239┊259┊        addChat: {
-┊240┊   ┊          id: ChatsService.getRandomId(),
+┊   ┊260┊          id: ouiId,
 ┊241┊261┊          __typename: 'Chat',
 ┊242┊262┊          name: users.find(user => user.id === recipientId).name,
 ┊243┊263┊          picture: users.find(user => user.id === recipientId).picture,
```
```diff
@@ -255,11 +275,12 @@
 ┊255┊275┊        // Write our data back to the cache.
 ┊256┊276┊        store.writeQuery({ query: getChatsQuery, data: {chats} });
 ┊257┊277┊      },
-┊258┊   ┊    });
+┊   ┊278┊    }).pipe(share());
+┊   ┊279┊    return this.addChat$;
 ┊259┊280┊  }
 ┊260┊281┊
-┊261┊   ┊  addGroup(recipientIds: string[], groupName: string) {
-┊262┊   ┊    return this.apollo.mutate({
+┊   ┊282┊  addGroup(recipientIds: string[], groupName: string, ouiId: string) {
+┊   ┊283┊    this.addChat$ = this.apollo.mutate({
 ┊263┊284┊      mutation: addGroupMutation,
 ┊264┊285┊      variables: <AddGroup.Variables>{
 ┊265┊286┊        recipientIds,
```
```diff
@@ -268,7 +289,7 @@
 ┊268┊289┊      optimisticResponse: {
 ┊269┊290┊        __typename: 'Mutation',
 ┊270┊291┊        addGroup: {
-┊271┊   ┊          id: ChatsService.getRandomId(),
+┊   ┊292┊          id: ouiId,
 ┊272┊293┊          __typename: 'Chat',
 ┊273┊294┊          name: groupName,
 ┊274┊295┊          picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
```
```diff
@@ -286,6 +307,7 @@
 ┊286┊307┊        // Write our data back to the cache.
 ┊287┊308┊        store.writeQuery({ query: getChatsQuery, data: {chats} });
 ┊288┊309┊      },
-┊289┊   ┊    });
+┊   ┊310┊    }).pipe(share());
+┊   ┊311┊    return this.addChat$;
 ┊290┊312┊  }
 ┊291┊313┊}
```

[}]: #


[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](step8.md) |
|:----------------------|

[}]: #
