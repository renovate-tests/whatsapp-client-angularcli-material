import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GetUsers} from '../../../../types';

@Component({
  selector: 'app-user-item',
  template: `
    <button mat-menu-item (click)="emitSelected()" [ngClass]="{selected: selected}">
      <div>
        <img [src]="user.picture" *ngIf="user.picture">
      </div>
      <div>{{ user.name }}</div>
    </button>
  `,
  styleUrls: ['user-item.component.scss']
})
export class UserItemComponent {
  @Input()
  user: GetUsers.Users;
  @Input()
  selected: false;

  @Output()
  select = new EventEmitter<string>();

  emitSelected() {
    this.select.emit(this.user.id);
  }
}
