import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { PartyChoosingMenuComponent } from './party-choosing-menu.component';

import {
  Menu, PartyMenu, PartyMenuUpdateRequest, PartyMenuCreateRequest
} from '../types/menu';
import { PartyState } from '../types/party';

import { UserService } from '../services/user.service';
import { PartyService } from '../services/party.service';

const mockPartyMenu1 = { id: 1, menuId: 1, quantity: 2, userIds: [1] };
const mockPartyMenu2 = { id: 2, menuId: 2, quantity: 2, userIds: [1, 2] };
const mockPartyMenu3 = { id: 3, menuId: 3, quantity: 1, userIds: [2] };

const mockMenu1 = { id: 1, name: 'Mock Menu 1', price: -120 };

class MockUserService {
  signedInUserId = 1;
}

class MockPartyService {
  partyStateUpdate: EventEmitter<PartyState> = new EventEmitter();
  partyMenuCreate: EventEmitter<PartyMenu[]> = new EventEmitter();
  partyState: PartyState = {
    id: 1,
    phase: 0,
    restaurant: null,
    members: [],
    menus: []
  };
  getMenus() {
    return new Promise(resolve => resolve([mockMenu1]));
  }
  createMenu(partyMenuCreateRequest: PartyMenuCreateRequest) {

  }
  updateMenu(partyMenuUpdateRequest: PartyMenuUpdateRequest) {

  }
}

@Component({selector: 'app-select-menu', template: ''})
class MockSelectMenuComponent {
  @Input() menus: Menu[];
  @Input() loggedInUserId: number;
  @Output() request: EventEmitter<PartyMenuCreateRequest>;
  @Output() cancel: EventEmitter<void>;
}

describe('PartyChoosingMenuComponent', () => {
  let component: PartyChoosingMenuComponent;
  let fixture: ComponentFixture<PartyChoosingMenuComponent>;

  let mockPartyService: MockPartyService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PartyChoosingMenuComponent,
        MockSelectMenuComponent,
      ],
      imports: [
        HttpClientModule,
      ],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: PartyService, useClass: MockPartyService },
      ]
    })
    .compileComponents();
  }));

  it('should not update menu when not preloaded', () => {
    fixture = TestBed.createComponent(PartyChoosingMenuComponent);
    mockPartyService = TestBed.get(PartyService);
    mockPartyService.partyState = {
      id: 1,
      phase: 0,
      restaurant: null,
      members: [],
      menus: undefined
    };
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyChoosingMenuComponent);
    mockPartyService = TestBed.get(PartyService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('menu should set when partyStateUpdate', async(() => {
    mockPartyService.partyStateUpdate.emit({
      id: 1,
      phase: 0,
      restaurant: null,
      members: [],
      menus: [mockPartyMenu1, mockPartyMenu2]
    });
    fixture.whenStable().then(() => {
      expect(component.menus).toEqual([mockPartyMenu1, mockPartyMenu2]);
    });
  }));

  it('menu should set when partyMenuCreate', async(() => {
    mockPartyService.partyMenuCreate.emit([mockPartyMenu1, mockPartyMenu2]);
    fixture.whenStable().then(() => {
      expect(component.menus).toEqual([mockPartyMenu1, mockPartyMenu2]);
    });
  }));

  it('getMenuNameById should return name if exist', async(() => {
    fixture.whenStable().then(() => {
      expect(component.getMenuNameById(1)).toEqual(mockMenu1.name);
    });
  }));

  it('getMenuNameById should return empty string if not exist', async(() => {
    fixture.whenStable().then(() => {
      expect(component.getMenuNameById(2)).toEqual('');
    });
  }));

  it('toggleAddMenu should toggle showAddMenuDialog', () => {
    component.showAddMenuDialog = true;
    component.toggleAddMenu();
    expect(component.showAddMenuDialog).toBeFalsy();

    component.showAddMenuDialog = false;
    component.toggleAddMenu();
    expect(component.showAddMenuDialog).toBeTruthy();
  });

  it('cancelAddMenu should set showAddMenuDialog to false', () => {
    component.showAddMenuDialog = true;
    component.cancelAddMenu(undefined);
    expect(component.showAddMenuDialog).toBeFalsy();
  });

  it('requestAddMenu should set showAddMenuDialog to false and request', () => {
    spyOn(mockPartyService, 'createMenu');
    const mockPartyMenuCreateRequest = {
      menuId: 2,
      quantity: 1,
      users: [1]
    };

    component.showAddMenuDialog = true;
    component.requestAddMenu(mockPartyMenuCreateRequest);
    expect(component.showAddMenuDialog).toBeFalsy();
    expect(mockPartyService.createMenu)
      .toHaveBeenCalledWith(mockPartyMenuCreateRequest);
  });

  it('updatePartyMenu should remove all when no people', async(() => {
    spyOn(mockPartyService, 'updateMenu');
    component.menus = [mockPartyMenu1, mockPartyMenu2];
    fixture.whenStable().then(() => {
      component.updatePartyMenu(mockPartyMenu1, -1, true);
      expect(mockPartyService.updateMenu).toHaveBeenCalledWith({
        id: mockPartyMenu1.id,
        quantityDelta: -mockPartyMenu1.quantity,
        addUserIds: [],
        removeUserIds: mockPartyMenu1.userIds
      });
    });
  }));

  it('updatePartyMenu should remove me when people and quantity', async(() => {
    spyOn(mockPartyService, 'updateMenu');
    component.menus = [mockPartyMenu1, mockPartyMenu2];
    fixture.whenStable().then(() => {
      component.updatePartyMenu(mockPartyMenu2, -1, true);
      expect(mockPartyService.updateMenu).toHaveBeenCalledWith({
        id: mockPartyMenu2.id,
        quantityDelta: -1,
        addUserIds: [],
        removeUserIds: [1]
      });
    });
  }));

  it('updatePartyMenu should add me when removing false', async(() => {
    spyOn(mockPartyService, 'updateMenu');
    component.menus = [mockPartyMenu3];
    fixture.whenStable().then(() => {
      component.updatePartyMenu(mockPartyMenu3, 1, false);
      expect(mockPartyService.updateMenu).toHaveBeenCalledWith({
        id: mockPartyMenu3.id,
        quantityDelta: 1,
        addUserIds: [1],
        removeUserIds: []
      });
    });
  }));

  it('isUserId should return true when I am in', () => {
    expect(component.isAssigned([3, 5, 1, 2])).toBeTruthy();
  });

  it('isUserId should return false when I am not in', () => {
    expect(component.isAssigned([7, 2, 9, 4])).toBeFalsy();
  });

});
