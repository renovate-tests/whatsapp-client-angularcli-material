import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GetUsers} from '../../../../types';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-users-list',
  template: `
    <mat-list>
      <mat-list-item *ngFor="let user of users">
        <app-user-item [user]="user" [selected]="isSelected(user.id)" (select)="selectUser($event)"></app-user-item>
      </mat-list-item>
    </mat-list>

    <button *ngIf="multipleSelection" [disabled]="!selectedUserIds.length" class="group-next" mat-fab color="primary"
            (click)="confirmSelection()">
      <mat-icon aria-label="Icon-button with a + icon">arrow_forward</mat-icon>
    </button>
  `,
  styleUrls: ['users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  @Input()
  users$: Observable<GetUsers.Users[]>;
  users: GetUsers.Users[];
  @Input()
  multipleSelection = false;

  selectedUserIds: string[] = [];

  @Output()
  selectUsers = new EventEmitter<string[]>();

  ngOnInit() {
    this.users$.subscribe(users => {
      this.users = users;
    });
  }

  isSelected(id: string) {
    return this.selectedUserIds.includes(id);
  }

  selectUser(userId: string) {
    if (this.selectedUserIds.includes(userId)) {
      this.selectedUserIds = this.selectedUserIds.filter(selectedUserId => selectedUserId !== userId);
    } else {
      this.selectedUserIds = this.selectedUserIds.concat(userId);
    }

    if (!this.multipleSelection) {
      this.selectUsers.emit(this.selectedUserIds);
    }
  }

  confirmSelection() {
    if (this.selectedUserIds.length) {
      this.selectUsers.emit(this.selectedUserIds.filter(userId => this.users.find(user => user.id === userId)));
    }
  }
}
