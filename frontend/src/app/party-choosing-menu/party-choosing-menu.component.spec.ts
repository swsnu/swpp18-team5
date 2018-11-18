import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { PartyChoosingMenuComponent } from './party-choosing-menu.component';

import { Menu, PartyMenu, PartyMenuCreateRequest } from '../types/menu';
import { PartyState } from '../types/party';

import { UserService } from '../services/user.service';
import { PartyService } from '../services/party.service';

class MockUserService {
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
    return new Promise(resolve => resolve([]));
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

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyChoosingMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
