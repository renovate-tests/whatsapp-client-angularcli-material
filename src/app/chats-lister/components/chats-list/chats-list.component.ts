import {Component, Input} from '@angular/core';
import {GetChats} from '../../../../types';
import {SelectableListDirective} from '../../../selectable-list/directive/selectable-list/selectable-list.directive';

@Component({
  selector: 'app-chats-list',
  template: `
    <mat-list>
      <mat-list-item *ngFor="let chat of chats">
        <app-chat-item [item]="chat"
                       appSelectableItem></app-chat-item>
        <!--[selected]="isSelected(chat.id)" [selecting]="selecting"-->
        <!--(single)="goToChat($event)" (multiple)="selectChat($event)"-->
      </mat-list-item>
    </mat-list>
    <!--<ng-content *ngIf="selectableListDirective.selecting"></ng-content>-->

    <!--<button *ngIf="selectedChatIds.length" class="confirm-deletion" mat-fab color="primary"
            (click)="confirmSelection()">
      <mat-icon aria-label="Icon-button with a + icon">delete</mat-icon>
    </button>-->
  `,
  styleUrls: ['chats-list.component.scss'],
})
export class ChatsListComponent {
  // tslint:disable-next-line:no-input-rename
  @Input('items')
  chats: GetChats.Chats[];

  constructor(public selectableListDirective: SelectableListDirective) {}

  /*@Output()
  view = new EventEmitter<string>();

  selectedChatIds: string[] = [];

  @Output()
  remove = new EventEmitter<string[]>();

  // selecting = false;

  @Output()
  isSelecting = new EventEmitter<boolean>();

  goToChat(chatId: string) {
    this.view.emit(chatId);
  }

  isSelected(id: string) {
    return this.selectedChatIds.includes(id);
  }*/

  /*selectChat(chatId: string) {
    if (this.selectedChatIds.includes(chatId)) {
      this.selectedChatIds = this.selectedChatIds.filter(selectedChatId => selectedChatId !== chatId);
    } else {
      this.selectedChatIds = this.selectedChatIds.concat(chatId);
    }
    if (this.selecting !== !!this.selectedChatIds.length) {
      this.selecting = !!this.selectedChatIds.length;
      this.isSelecting.emit(this.selecting);
    }
  }

  confirmSelection() {
    if (this.selectedChatIds.length) {
      this.remove.emit(this.selectedChatIds.filter(chatId => this.chats.find(chat => chat.id === chatId)));
      this.selectedChatIds = [];
      this.selecting = false;
      this.isSelecting.emit(false);
    }
  }*/
}
