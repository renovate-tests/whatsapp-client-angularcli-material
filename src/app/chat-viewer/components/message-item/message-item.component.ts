import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GetChat} from '../../../../types';

@Component({
  selector: 'app-message-item',
  template: `
      <div class="message" (press)="emitSelected()" [ngClass]="{'mine': message.ownership, selected: selected}">
        <div *ngIf="isGroup && !message.ownership" class="message-sender">{{ message.sender.name }}</div>
        <div>{{ message.content }}</div>
      </div>
  `,
  styleUrls: ['message-item.component.scss'],
})
export class MessageItemComponent {
  @Input()
  message: GetChat.Messages;

  @Input()
  isGroup: boolean;

  @Input()
  selected = false;

  @Output()
  select = new EventEmitter<string>();

  emitSelected() {
    console.log('press');
    this.select.emit(this.message.id);
  }
}
