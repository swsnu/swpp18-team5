import { TestBed, inject, async } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WebSocketSubject, WebSocketSubjectConfig, webSocket } from 'rxjs/webSocket';
import { Observable, Observer, of } from 'rxjs';

import { Menu } from '../types/menu';
import { PartyService } from './party.service';
import { Party, PartyType, PartyState } from '../types/party';

const mockParties: Party[] = [
  {
    id: 1,
    name: 'Name 1',
    type: PartyType.InGroup,
    location: 'Location 1',
    leaderId: 1,
    since: 'Since 1',
    memberCount: 1,
  },
  {
    id: 2,
    name: 'Name 2',
    type: PartyType.Private,
    location: 'Location 2',
    leaderId: 2,
    since: 'Since 2',
    memberCount: 2,
  },
];

const mockParty: Party = {
  id: 3,
  name: 'Name 3',
  type: PartyType.InGroup,
  location: 'Location 3',
  leaderId: 3,
  since: 'Since 3',
  memberCount: 3,
};

const mockMenus: Menu[] = [
  { id: 1, name: 'MockMenu1', price: 1000 },
  { id: 2, name: 'MockMenu2', price: 2000 },
];

const mockPartyState: PartyState = {
  id: 1,
  phase: 1,
  restaurant: 1,
  members: [1, 2],
  menus: [
    { id: 100, menuId: 1, quantity: 2, userIds: [1, 2] },
  ]
};

class MockWebSocketSubject extends WebSocketSubject<any> {
  constructor() {
    super(undefined);
  }

  next(data) { }
  subscribe(func) {
    return undefined;
  }
}

describe('PartyService', () => {
  let httpTestingController: HttpTestingController;
  let partyService: PartyService;
  const partyApi = 'api/party/';
  const getMockPartyState = () => JSON.parse(JSON.stringify(mockPartyState));
  const initMockWebSocket = () => partyService.webSocket$ = new MockWebSocketSubject();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        PartyService,
        { provide: WebSocketSubject, useClass: MockWebSocketSubject }
      ]
    });
    httpTestingController = TestBed.get(HttpTestingController);
    partyService = TestBed.get(PartyService);
  });

  it('should be created', inject([PartyService], (service: PartyService) => {
    expect(service).toBeTruthy();
  }));

  it('should get all parties with get request', async(() => {
    partyService.getParties().then(parties => expect(parties).toEqual(mockParties));

    const req = httpTestingController.expectOne(partyApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockParties);
  }));

  it('should get party of id with get request', async(() => {
    partyService.getParty(mockParty.id).then(party => expect(party).toEqual(mockParty));

    const req = httpTestingController.expectOne(`${partyApi}${mockParty.id}/`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockParty);
  }));

  it('should add party with post request', async(() => {
    const newParty = {
      id: 0,
      name: 'Name 0',
      type: PartyType.Private,
      location: 'Location 0',
      leaderId: 0,
      since: 'Since 0',
      memberCount: 1,
    };
    partyService.addParty(newParty).then(party => expect(party).toEqual(mockParty));
    const req = httpTestingController.expectOne(partyApi);
    expect(req.request.method).toEqual('POST');
    req.flush(mockParty);
  }));

  it('should update party with put request', async(() => {
    partyService.updateParty(mockParty).then(party => expect(party).toEqual(mockParty));
    const req = httpTestingController.expectOne(`${partyApi}${mockParty.id}/`);
    expect(req.request.method).toEqual('PUT');
    req.flush(mockParty);
  }));

  it('should delete party with delete request', async(() => {
    partyService.deleteParty(mockParty.id);
    const req = httpTestingController.expectOne(`${partyApi}${mockParty.id}/`);
    expect(req.request.method).toEqual('DELETE');
    req.flush({});
  }));

  it('getParty should return undefined if party id not specified', async(() => {
    partyService.getParty(undefined).then(data => expect(data).toEqual(undefined));
  }));

  it('getMenus should get menus of restaurant', async(() => {
    partyService.partyState = {
      id: 1,
      phase: 1,
      restaurant: 1,
      members: [1, 2],
      menus: []
    };
    partyService.getMenus().then(data => expect(data).toEqual(mockMenus));
    const req = httpTestingController.expectOne(`api/restaurant/1/menu/`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockMenus);
  }));

  it('handleWebsocket should emit joined member id if party.join', async(() => {
    spyOn(partyService.partyJoin, 'emit');
    partyService.handleWebsocket({
      'type': 'party.join',
      'user_id': 2
    });
    expect(partyService.partyJoin.emit).toHaveBeenCalledWith(2);
  }));

  it('handleWebsocket should emit left member id if party.leave', async(() => {
    spyOn(partyService.partyLeave, 'emit');
    partyService.handleWebsocket({
      'type': 'party.leave',
      'user_id': 1
    });
    expect(partyService.partyLeave.emit).toHaveBeenCalledWith(1);
  }));

  it('handleWebsocket should emit if initial.not.joined and no specified party id',
    async(() => {
      spyOn(partyService.partyNotJoined, 'emit');
      partyService.handleWebsocket({ 'type': 'initial.not.joined' });
      expect(partyService.partyNotJoined.emit).toHaveBeenCalledTimes(1);
    })
  );

  it('handleWebsocket should try to join if initial.not.joined and specified party id',
    async(() => {
      initMockWebSocket();
      partyService.joinedPartyId = 1;
      spyOn(partyService.webSocket$, 'next');
      partyService.handleWebsocket({ 'type': 'initial.not.joined' });
      expect(partyService.webSocket$.next).toHaveBeenCalledWith({
        'command': 'party.join',
        'party_id': 1
      });
    })
  );

  it('handleWebsocket should update partyState if state.update', async(() => {
    spyOn(partyService.partyStateUpdate, 'emit');
    partyService.handleWebsocket({
      'type': 'state.update',
      'state': {
        'id': 1,
        'phase': 1,
        'restaurant': 1,
        'members': [1, 2],
        'menus': {
          100: [ 1, 2, [1, 2] ],
        },
      },
    });

    expect(partyService.partyState).toEqual(mockPartyState);
    expect(partyService.partyStateUpdate.emit).toHaveBeenCalledWith(mockPartyState);
  }));

  it('handleWebsocket should create menu if menu.create', async(() => {
    partyService.partyState = getMockPartyState();
    spyOn(partyService.partyMenuCreate, 'emit');
    partyService.handleWebsocket({
      'type': 'menu.create',
      'menu_entry_id': 101,
      'menu_id': 2,
      'quantity': 3,
      'users': [1],
    });
    const expected = getMockPartyState();
    expected.menus = [
      { id: 100, menuId: 1, quantity: 2, userIds: [1, 2] },
      { id: 101, menuId: 2, quantity: 3, userIds: [1] },
    ];

    expect(partyService.partyState).toEqual(expected);
    expect(partyService.partyMenuCreate.emit).toHaveBeenCalledWith(expected.menus);
  }));

  it('handleWebsocket should update menu if menu.update', async(() => {
    partyService.partyState = getMockPartyState();
    spyOn(partyService.partyMenuUpdate, 'emit');
    partyService.handleWebsocket({
      'type': 'menu.update',
      'menu_entry_id': 100,
      'quantity': -1,
      'add_user_ids': [3],
      'remove_user_ids': [1, 2],
    });
    const expected = getMockPartyState();
    expected.menus = [
      { id: 100, menuId: 1, quantity: 1, userIds: [3] },
    ];
    expect(partyService.partyState).toEqual(expected);
    expect(partyService.partyMenuUpdate.emit).toHaveBeenCalledWith(expected.menus);
  }));

  it('handleWebsocket should not update menu if nonexistent menu.update', async(() => {
    partyService.partyState = getMockPartyState();
    spyOn(partyService.partyMenuUpdate, 'emit');
    partyService.handleWebsocket({
      'type': 'menu.update',
      'menu_entry_id': 101,
      'quantity': -1,
      'add_user_ids': [3],
      'remove_user_ids': [1, 2],
    });
    const expected = getMockPartyState();
    expect(partyService.partyState).toEqual(expected);
    expect(partyService.partyMenuUpdate.emit).toHaveBeenCalledTimes(0);
  }));

  it('handleWebsocket should do nothing if invalid event type', async(() => {
    partyService.handleWebsocket({
      'type': 'kipa.cup',
    });
  }));

  it('connectWebsocket should connect and subscribe if connected and will join',
    async(() => {
      initMockWebSocket();
      partyService.isJoined = false;
      partyService.joinedPartyId = 15;
      spyOn(partyService.webSocket$, 'next');

      partyService.connectWebsocket();
      expect(partyService.webSocket$.next).toHaveBeenCalledWith({
        'command': 'party.join',
        'party_id': 15
      });
    })
  );

  it('connectWebsocket should connect and subscribe if connected and joined',
    async(() => {
      initMockWebSocket();
      partyService.joinedPartyId = 15;
      spyOn(partyService.webSocket$, 'next');

      partyService.connectWebsocket();
      expect(partyService.webSocket$.next).toHaveBeenCalledTimes(0);
    })
  );

  it('leaveParty should send party.leave request', async(() => {
    initMockWebSocket();
    partyService.joinedPartyId = 15;
    partyService.subscription = of(undefined).subscribe(x => { });
    spyOn(partyService.webSocket$, 'next');

    const was_next = partyService.webSocket$.next;
    partyService.leaveParty();
    expect(was_next).toHaveBeenCalledWith({
      'command': 'party.leave',
      'party_id': 15,
    });
  }));

  it('createMenu should send menu.create request', async(() => {
    initMockWebSocket();
    spyOn(partyService.webSocket$, 'next');

    partyService.createMenu({ menuId: 1, quantity: 3, users: [1, 2] });
    expect(partyService.webSocket$.next).toHaveBeenCalledWith({
      'command': 'menu.create',
      'menu_id': 1,
      'quantity': 3,
      'users': [1, 2],
    });
  }));

  it('updateMenu should send menu.update request', async(() => {
    initMockWebSocket();
    spyOn(partyService.webSocket$, 'next');

    partyService.updateMenu({
      id: 1, quantityDelta: 3, addUserIds: [1, 2], removeUserIds: [3]
    });
    expect(partyService.webSocket$.next).toHaveBeenCalledWith({
      'command': 'menu.update',
      'menu_entry_id': 1,
      'quantity': 3,
      'add_user_ids': [1, 2],
      'remove_user_ids': [3],
    });
  }));

});
