import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-new-group-details',
  template: `
    <input type="text" [(ngModel)]="groupName"/>
    <button [disabled]="!groupName" class="new-group" mat-fab color="primary" (click)="emitGroupDetails()">
      <mat-icon aria-label="Icon-button with a + icon">arrow_forward</mat-icon>
    </button>
  `,
  styleUrls: ['new-group-details.component.scss'],
})
export class NewGroupDetailsComponent {
  groupName: string;
  @Output()
  groupDetails = new EventEmitter<string>();

  emitGroupDetails() {
    if (this.groupDetails) {
      this.groupDetails.emit(this.groupName);
    }
  }
}
