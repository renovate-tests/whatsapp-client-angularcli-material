import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GetChats} from '../../../../types';

@Component({
  selector: 'app-chat-item',
  template: `
    <div class="chat-row" (tap)="handleEvent($event)" (press)="handleEvent($event)" [ngClass]="{'selected': selected}">
        <div class="chat-recipient">
          <img [src]="chat.picture" width="48" height="48">
          <div>{{ chat.name }} [id: {{ chat.id }}]</div>
        </div>
        <div class="chat-content">{{ chat.lastMessage?.content | truncate : 20 : '...' }}</div>
    </div>
  `,
  styleUrls: ['chat-item.component.scss'],
})
export class ChatItemComponent {
  @Input()
  chat: GetChats.Chats;

  @Input()
  selected = false;

  @Input()
  selecting = false;

  @Output()
  view = new EventEmitter<string>();

  @Output()
  select = new EventEmitter<string>();

  viewChat() {
    this.view.emit(this.chat.id);
  }

  selectChat() {
    this.select.emit(this.chat.id);
  }

  handleEvent({type}) {
    if (this.selecting || type === 'press') {
      this.selectChat();
    } else {
      this.viewChat();
    }
  }
}
