import {AfterViewInit, Directive, ElementRef, HostListener, Inject, Input, Renderer2} from '@angular/core';
import {Mode, SelectableListService} from '../selectable-list/selectable-list.directive';

@Directive({
  selector: '[appSelectableItem]',
})
export class SelectableItemDirective implements AfterViewInit {
  container: HTMLElement;

  get mode(): Mode {
    return this.selectableListService.mode;
  }

  @Input()
  item: { id: string };

  // @Input()
  // selected: boolean;
  get selected(): boolean {
    return this.selectableListService.selectedItemIds.includes(this.item.id);
  }

  // @Input()
  // selecting: boolean;
  get selecting(): boolean {
    return this.selectableListService.selecting;
  }

  /* We can't listen for EventEmitter in other directives, so we have to use CustomEvent instead
  @Output()
  single = new EventEmitter<string>();

  @Output()
  multiple = new EventEmitter<string>();
  */

  constructor(private el: ElementRef,
              private renderer: Renderer2,
              @Inject('selectable-list-service') private selectableListService: SelectableListService) {
  }

  ngAfterViewInit() {
    this.container = this.el.nativeElement.querySelector(':only-child');
  }

  @HostListener('tap')
  onTap() {
    this.handleEvent('tap');
  }

  @HostListener('press')
  onPress() {
    this.handleEvent('press');
  }

  handleEvent(type: string) {
    switch (this.mode) {
      case Mode.single:
        this.dispatchEvent('single');
        break;

      case Mode.multiple_tap:
        this.switchBackground();
        this.dispatchEvent('multiple');
        break;

      case Mode.multiple_press:
        if (this.selecting || type === 'press') {
          this.switchBackground();
          this.dispatchEvent('multiple');
        }
        break;

      case Mode.both:
        if (this.selecting || type === 'press') {
          this.switchBackground();
          this.dispatchEvent('multiple');
        } else if (type === 'tap') {
          this.dispatchEvent('single');
        }
        break;
    }
  }

  switchBackground() {
    this.selected ? this.renderer.removeStyle(this.container, 'background-color')
      : this.renderer.setStyle(this.container, 'background-color', 'lightblue');
  }

  dispatchEvent(type: 'single' | 'multiple') {
    this.selectableListService[type].emit(this.item.id);
    /* Since we now use a service for inter-directive communication we don't need CustomEvent anymore
    // If the event won't bubble I'll need this.renderer.listen(selectableItem... in the selectable-list directive
    const event = new CustomEvent(type, {detail: this.item.id, bubbles: true, cancelable: true});
    this.el.nativeElement.dispatchEvent(event);

    // We can't listen for EventEmitter in other directives, so we have to use CustomEvent instead
    // this[type].emit(this.item.id);
    */
  }
}
