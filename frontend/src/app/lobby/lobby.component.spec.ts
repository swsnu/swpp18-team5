import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { LobbyComponent } from './lobby.component';
import { Party, PartyType } from '../types/party';
import { PartyService } from '../services/party.service';
import { User } from '../types/user';
import { UserService } from '../services/user.service';

const mockUser: User = {
  id: 1,
  email: 'user1@mail.com',
  username: 'User 1',
};

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

@Component({ selector: 'app-lobby-list-item', template: '' })
class MockLobbyListItemComponent {
  @Input() party;
  @Input() joinedPartyId;
}

describe('LobbyComponent', () => {
  let component: LobbyComponent;
  let fixture: ComponentFixture<LobbyComponent>;
  let partyService: jasmine.SpyObj<PartyService>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const partySpy = jasmine.createSpyObj('PartyService', ['getParties', 'connectWebsocket']);
    const userSpy = jasmine.createSpyObj('UserService', ['getSignedInUsername']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
      ],
      declarations: [
        LobbyComponent,
        MockLobbyListItemComponent,
      ],
      providers: [
        { provide: PartyService, useValue: partySpy },
        { provide: UserService, useValue: userSpy },
        { provide: Router, useValue: routerSpy },
      ]
    }).compileComponents();

    partyService = TestBed.get(PartyService);
    partyService.getParties.and.returnValue(new Promise(resolve => resolve(mockParties)));
    userService = TestBed.get(UserService);
    userService.getSignedInUsername.and.returnValue(mockUser.username);
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get parties', async(() => {
    component.ngOnInit();
    fixture.whenStable().then( () => {
      fixture.detectChanges();
      expect(partyService.getParties).toHaveBeenCalled();
      expect(component.parties).toEqual(mockParties);
    });
  }));

  it('createParty should navigate to /party/new', async(() => {
    component.createParty();
    expect(router.navigate).toHaveBeenCalledWith(['/party/new']);
  }));
});
