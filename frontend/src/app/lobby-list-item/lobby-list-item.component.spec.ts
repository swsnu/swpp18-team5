import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { LobbyListItemComponent } from './lobby-list-item.component';
import { Party, PartyType } from '../types/party';

const mockLobbyListItem: Party = {
  id: 1,
  name: 'Name 1',
  type: PartyType.Private,
  location: 'Location 1',
  leaderId: 1,
  since: 'Since 1',
  memberCount: 1,
};

describe('LobbyListItemComponent', () => {
  let component: LobbyListItemComponent;
  let fixture: ComponentFixture<LobbyListItemComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      declarations: [LobbyListItemComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
      ]
    })
      .compileComponents();
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LobbyListItemComponent);
    component = fixture.componentInstance;
    component.party = mockLobbyListItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have as id 1', () => {
    expect(fixture.nativeElement.querySelector('#party-id').textContent)
    .toEqual(String(component.party.id));
  });

  it(`should have as name 'Name 1'`, () => {
    expect(fixture.nativeElement.querySelector('#party-name').textContent)
    .toEqual(component.party.name);
  });

  it('routeToParty should set and navigate to /party/', () => {
    component.routeToParty(1234);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/party/');
  });
});
