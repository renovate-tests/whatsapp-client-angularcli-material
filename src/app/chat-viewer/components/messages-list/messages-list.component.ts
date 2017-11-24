import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GetChat} from '../../../../types';

@Component({
  selector: 'app-messages-list',
  template: `
    <mat-list>
      <mat-list-item *ngFor="let message of messages">
        <app-message-item [message]="message" [isGroup]="isGroup"
                          [selected]="isSelected(message.id)" [selecting]="selecting" (select)="selectMessage($event)"></app-message-item>
      </mat-list-item>
    </mat-list>

    <button *ngIf="selectedMessageIds.length" class="confirm-deletion" mat-fab color="primary"
            (click)="confirmSelection()">
      <mat-icon aria-label="Icon-button with a + icon">delete</mat-icon>
    </button>
  `,
  styleUrls: ['messages-list.component.scss'],
})
export class MessagesListComponent {
  @Input()
  messages: GetChat.Messages[];

  @Input()
  isGroup: boolean;

  selectedMessageIds: string[] = [];

  @Output()
  remove = new EventEmitter<string[]>();

  selecting = false;

  isSelected(id: string) {
    return this.selectedMessageIds.includes(id);
  }

  selectMessage(messageId: string) {
    if (this.selectedMessageIds.includes(messageId)) {
      this.selectedMessageIds = this.selectedMessageIds.filter(selectedMessageId => selectedMessageId !== messageId);
    } else {
      this.selectedMessageIds = this.selectedMessageIds.concat(messageId);
    }
    this.selecting = !!this.selectedMessageIds.length;
  }

  confirmSelection() {
    if (this.selectedMessageIds.length) {
      this.remove.emit(this.selectedMessageIds.filter(messageId => this.messages.find(message => message.id === messageId)));
      this.selectedMessageIds = [];
      this.selecting = false;
    }
  }
}
