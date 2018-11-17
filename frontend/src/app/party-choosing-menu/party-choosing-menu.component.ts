import { Component, OnInit } from '@angular/core';

import { PartyService } from '../services/party.service';
import { UserService } from '../services/user.service';
import { Menu, PartyMenu, PartyMenuUpdateRequest } from '../types/menu';

@Component({
  selector: 'app-party-choosing-menu',
  templateUrl: './party-choosing-menu.component.html',
  styleUrls: ['./party-choosing-menu.component.css']
})
export class PartyChoosingMenuComponent implements OnInit {

  menus: PartyMenu[];
  menusOfRestaurant: Menu[];
  showAddMenuDialog: boolean;

  constructor(private userService: UserService, private partyService: PartyService) { }

  ngOnInit() {
    this.menus = [];
    this.menusOfRestaurant = [];
    this.showAddMenuDialog = false;

    this.partyService.getMenus().then(menus => {
      this.menusOfRestaurant = menus;
    });
    this.partyService.partyStateUpdate.subscribe(partyState => {
      this.menus = partyState.menus;
    });
    this.partyService.partyMenuCreate.subscribe(menus => {
      this.menus = menus;
    });

    if (this.partyService.partyState.menus) {
      this.menus = this.partyService.partyState.menus;
    }
    /*
    this.partyService.partyMenuAssign.subscribe(updateRequest => {
    });
    //*/
  }

  getMenuNameById(id: number) {
    const menu = this.menusOfRestaurant.filter(menuor => menuor.id === id);
    if (menu.length) {
      return menu[0].name;
    }
    return '';
  }

  // adding menus

  requestAddMenu(event) {
    this.partyService.createMenu(event);
    this.showAddMenuDialog = false;
  }

  cancelAddMenu(event) {
    this.showAddMenuDialog = false;
  }

  toggleAddMenu() {
    this.showAddMenuDialog = !this.showAddMenuDialog;
  }

  isAssigned(userIds) {
    return userIds.some(x => x === this.userService.signedInUserId);
  }

  updatePartyMenu(partyMenu, quantityDelta, removing) {
    if (partyMenu.quantity + quantityDelta <= 0 ||
      partyMenu.userIds.length + quantityDelta <= 0) {
        this.partyService.updateMenu({
          id: partyMenu.id,
          quantityDelta: -partyMenu.quantity,
          addUserIds: [],
          removeUserIds: partyMenu.userIds
        });
    } else if (removing) {
      this.partyService.updateMenu({
        id: partyMenu.id,
        quantityDelta: quantityDelta,
        addUserIds: [],
        removeUserIds: [this.userService.signedInUserId]
      });
    } else {
      this.partyService.updateMenu({
        id: partyMenu.id,
        quantityDelta: quantityDelta,
        addUserIds: [this.userService.signedInUserId],
        removeUserIds: []
      });
    }
  }

}
