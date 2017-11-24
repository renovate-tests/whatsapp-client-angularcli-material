import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GetChat} from '../../../../types';

@Component({
  selector: 'app-message-item',
  template: `
      <div class="message" (press)="emitSelected($event)" (tap)="emitSelected($event)"
           [ngClass]="{'mine': message.ownership, selected: selected}">
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

  @Input()
  selecting = false;

  @Output()
  select = new EventEmitter<string>();

  emitSelected({type}) {
    console.log(type);
    if (this.selecting) {
        this.select.emit(this.message.id);
    } else {
      if (type === 'press') {
        this.select.emit(this.message.id);
      }
    }
  }
}
