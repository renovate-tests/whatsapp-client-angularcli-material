import {Component, Input} from '@angular/core';
import {GetChat} from '../../../../types';
import {SelectableListDirective} from 'ngx-selectable-list';

@Component({
  selector: 'app-messages-list',
  template: `
    <mat-list>
      <mat-list-item *ngFor="let message of messages">
        <app-message-item [item]="message" [isGroup]="isGroup"
                          appSelectableItem></app-message-item>
      </mat-list-item>
    </mat-list>
    <ng-content *ngIf="selectableListDirective.selecting"></ng-content>
  `,
  styleUrls: ['messages-list.component.scss'],
})
export class MessagesListComponent {
  // tslint:disable-next-line:no-input-rename
  @Input('items')
  messages: GetChat.Messages[];

  @Input()
  isGroup: boolean;

  constructor(public selectableListDirective: SelectableListDirective) {}
}
