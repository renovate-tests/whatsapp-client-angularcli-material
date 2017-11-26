import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-confirm-selection',
  template: `
    <button class="confirm-deletion" mat-fab color="primary" (click)="handleClick()">
      <mat-icon aria-label="Icon-button with a + icon">delete</mat-icon>
    </button>
  `,
  styleUrls: ['./confirm-selection.component.scss'],
})
export class ConfirmSelectionComponent {
  @Output()
  emitClick = new EventEmitter<null>();

  handleClick() {
    this.emitClick.emit();
  }
}
