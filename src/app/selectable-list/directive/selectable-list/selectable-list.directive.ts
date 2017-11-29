import {
  AfterContentInit,
  ComponentFactoryResolver, ContentChild, Directive, ElementRef, EventEmitter, Inject, Input, OnDestroy, Output, Renderer2,
  ViewContainerRef
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

export class SelectableListService {
  selecting = false;
  selectedItemIds: string[] = [];
  single = new EventEmitter<string>();
  multiple = new EventEmitter<string>();
  mode: Mode = Mode.single;
}

export enum Mode {
  single = 'Single',
  multiple_tap = 'Multiple (tap activated)',
  multiple_press = 'Multiple (press activated)',
  both = 'Single and multiple (press activated)',
}

@Directive({
  selector: '[appSelectableList]',
  providers: [
    {
      provide: 'selectable-list-service',
      useValue: new SelectableListService(),
    }
  ],
})
export class SelectableListDirective implements OnDestroy, AfterContentInit {
  // component: ComponentRef<ConfirmSelectionComponent>;
  singleSubscription: Subscription;
  multipleSubscription: Subscription;
  // confirmSelectionSubscription: Subscription;
  clickListenerFn: () => void;

  set mode(value: Mode) {
    this.selectableListService.mode = value;
  }

  // _selecting = false;
  set selecting(value: boolean) {
    this.selectableListService.selecting = value;
  }

  get selecting(): boolean {
    return this.selectableListService.selecting;
  }

  // _selectedItemIds: string[] = [];
  set selectedItemIds(value: string[]) {
    /* It would have been necessary if we didn't use content projection to project the confirmation button
    if (!this.selectableListService.selectedItemIds.length && value.length) {
      // Create dynamic component
      const confirmSelectionFactory = this.resolver.resolveComponentFactory(ConfirmSelectionComponent);
      this.component = this.view.createComponent(confirmSelectionFactory);
      this.confirmSelectionSubscription = this.component.instance.emitClick.subscribe(() => this.confirmSelection());
    } else if (this.selectedItemIds.length && !value.length) {
      // Destroy dynamic component
      this.confirmSelectionSubscription.unsubscribe();
      this.component.destroy();
    }
    */
    this.selectableListService.selectedItemIds = value;
  }

  get selectedItemIds(): string[] {
    return this.selectableListService.selectedItemIds;
  }

  /* It would have been necessary if single and multiple didn't bubble
  set selectableItems(selectableItems: HTMLElement[]) {
    selectableItems.forEach(selectableItem => {
      this.renderer.listen(selectableItem, 'single', ({detail: id}: CustomEvent) => {
        console.log(`single ${id}`);
      });
      this.renderer.listen(selectableItem, 'multiple', ({detail: id}: CustomEvent) => {
        console.log(`multiple ${id}`);
      });
    });
  }
  */

  @Input()
  set appSelectableList(value: Mode) {
    if (value in Mode) {
      this.mode = Mode[value];
    }
  }

  @Input()
  items: { id: string }[];

  @Output()
  isSelecting = new EventEmitter<boolean>();

  @Output()
  single = new EventEmitter<string>();

  @Output()
  multiple = new EventEmitter<string[]>();

  @ContentChild('confirmSelection', {read: ElementRef}) confirmButton: any;

  constructor(private el: ElementRef,
              private renderer: Renderer2,
              private view: ViewContainerRef,
              private resolver: ComponentFactoryResolver,
              @Inject('selectable-list-service') private selectableListService: SelectableListService) {
    // Since services are singletons let's set some defaults
    this.selectableListService.selecting = false;
    this.selectableListService.selectedItemIds = [];
    this.selectableListService.single = new EventEmitter<string>();
    this.selectableListService.multiple = new EventEmitter<string>();
    this.selectableListService.mode = Mode.single;

    this.singleSubscription = this.selectableListService.single.subscribe(id => this.single.emit(id));
    this.multipleSubscription = this.selectableListService.multiple.subscribe(id => this.selectItem(id));
  }

  ngAfterContentInit() {
    if (this.confirmButton) {
      this.clickListenerFn = this.renderer.listen(this.confirmButton.nativeElement, 'click', () => this.confirmSelection());
    }
  }

  ngOnDestroy() {
    this.singleSubscription.unsubscribe();
    this.multipleSubscription.unsubscribe();
    if (this.clickListenerFn) {
      this.clickListenerFn();
    }
  }

  /* Since we now use a service for inter-directive communication we don't need CustomEvent anymore
  @HostListener('single', ['$event'])
  onSingle(event: CustomEvent) {
    const id = event.detail as string;
    event.stopPropagation();
    console.log(`single ${id}`);
  }

  @HostListener('multiple', ['$event'])
  onMultiple(event: CustomEvent) {
    const id = event.detail as string;
    event.stopPropagation();
    console.log(`multiple ${id}`);
    this.selectItem(id);
  }
  */

  /*
  ngAfterViewInit() {
    // It would have been necessary if single and multiple didn't bubble
    this.selectableItems = this.el.nativeElement.querySelectorAll('[appSelectableItem]') as HTMLElement[];

    // Every time the DOM changes we update selectableItems
    const observer = new MutationObserver(mutations => mutations.forEach(mutation => {
      this.selectableItems = this.el.nativeElement.querySelectorAll('[appSelectableItem]') as HTMLElement[];
    }));
    // Detect changes in the host element attributes
    const config = {attributes: true, childList: false, characterData: false};
    observer.observe(this.el.nativeElement, config);
  }
  */

  selectItem(itemId: string) {
    if (this.selectedItemIds.includes(itemId)) {
      this.selectedItemIds = this.selectedItemIds.filter(selectedItemId => selectedItemId !== itemId);
    } else {
      this.selectedItemIds = this.selectedItemIds.concat(itemId);
    }
    if (this.selecting !== !!this.selectedItemIds.length) {
      this.selecting = !!this.selectedItemIds.length;
      this.isSelecting.emit(this.selecting);
    }
  }

  confirmSelection() {
    if (this.selectedItemIds.length) {
      this.multiple.emit(this.selectedItemIds.filter(itemId => this.items.find(item => item.id === itemId)));
      this.selectedItemIds = [];
      this.selecting = false;
      this.isSelecting.emit(false);
    }
  }
}
