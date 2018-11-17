import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Menu, PartyMenuCreateRequest } from '../../types/menu';

@Component({
  selector: 'app-select-menu',
  templateUrl: './select-menu.component.html',
  styleUrls: ['./select-menu.component.css']
})
export class SelectMenuComponent implements OnInit {

  @Input() menus: Menu[];
  @Input() loggedInUserId: number;
  @Output() request: EventEmitter<PartyMenuCreateRequest>;
  @Output() cancel: EventEmitter<void>;

  menuId: number;
  quantity: number;

  constructor() {
    this.request = new EventEmitter();
    this.cancel = new EventEmitter();
  }

  ngOnInit() {
  }

  addRequest() {
    const requestMenu: number = +this.menuId;
    console.log(requestMenu);
    if (requestMenu === undefined || !this.quantity) {
      // TODO: showing error
    } else {
      this.request.next({
        menuId: requestMenu,
        quantity: this.quantity,
        users: [this.loggedInUserId]
      });
    }
  }

  cancelRequest() {
    this.cancel.next();
  }

}
