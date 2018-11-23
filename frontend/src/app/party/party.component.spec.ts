import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute, Router } from '@angular/router';
import { Component, EventEmitter } from '@angular/core';

import { Observable, of } from 'rxjs';

import { PartyComponent } from './party.component';
import { PartyService } from '../services/party.service';
import { Party, PartyType } from '../types/party';

const mockParty: Party = {
  id: 3,
  name: 'Name 3',
  type: PartyType.InGroup,
  location: 'Location 3',
  leaderId: 3,
  since: 'Since 3',
  memberCount: 3,
};

class MockParamMap {
  get(id): number {
    expect(id).toEqual('id');
    return mockParty.id;
  }
}

class MockSnapshot {
  paramMap = new MockParamMap();
}

class MockActivatedRoute {
  snapshot = new MockSnapshot();
}

@Component({ selector: 'app-party-choosing-restaurant', template: '' })
export class MockPartyChoosingRestaurantComponent {

}

@Component({ selector: 'app-party-choosing-menu', template: '' })
export class MockPartyChoosingMenuComponent {

}

@Component({ selector: 'app-party-ordering', template: '' })
export class MockPartyOrderingComponent {

}


@Component({ selector: 'app-party-ordered', template: '' })
export class MockPartyOrderedComponent {

}

@Component({ selector: 'app-party-payment', template: '' })
export class MockPartyPaymentComponent {

}

class MockPartyService {
  partyStateUpdate: EventEmitter<any> = new EventEmitter();

  getParty() {
    return new Promise(r => r(mockParty));
  }

  connectWebsocket() { }
}

describe('PartyComponent', () => {
  let component: PartyComponent;
  let fixture: ComponentFixture<PartyComponent>;
  let partyService: jasmine.SpyObj<PartyService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const partyServiceSpy = jasmine.createSpyObj('PartyService', [
      'getParty', 'joinParty', 'leaveParty', 'connectWebsocket',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [
        PartyComponent,
        MockPartyChoosingRestaurantComponent,
        MockPartyChoosingMenuComponent,
        MockPartyOrderingComponent,
        MockPartyOrderedComponent,
        MockPartyPaymentComponent,
      ],
      providers: [
        { provide: PartyService, useClass: MockPartyService },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
      ]
    })
      .compileComponents();

    partyService = TestBed.get(PartyService);

    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
