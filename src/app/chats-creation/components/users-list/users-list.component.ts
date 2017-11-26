import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GetUsers} from '../../../../types';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-users-list',
  template: `
    <mat-list>
      <mat-list-item *ngFor="let user of users">
        <app-user-item [item]="user"
                       appSelectableItem></app-user-item>
      </mat-list-item>
    </mat-list>
  `,
  styleUrls: ['users-list.component.scss'],
})
export class UsersListComponent {
  // tslint:disable-next-line:no-input-rename
  @Input('items')
  users: GetUsers.Users[];
}
