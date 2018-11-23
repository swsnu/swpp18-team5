import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PartyCreateComponent } from './party-create.component';
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

describe('PartyCreateComponent', () => {
  let component: PartyCreateComponent;
  let fixture: ComponentFixture<PartyCreateComponent>;
  let partyService: jasmine.SpyObj<PartyService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const partySpy = jasmine.createSpyObj('PartyService', [
      'addParty', 'connectWebsocket'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [PartyCreateComponent],
      providers: [
        { provide: PartyService, useValue: partySpy },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .compileComponents();

    partyService = TestBed.get(PartyService);
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('back should navigate to lobby', () => {
    component.back();
    expect(router.navigate).toHaveBeenCalledWith(['/lobby/']);
  });

  it('create should do nothing if already submitted', async(() => {
    component.submitting = true;
    component.create();
    fixture.whenStable().then(() => {
      expect(router.navigate).toHaveBeenCalledTimes(0);
    });
  }));

  it('create should call addParty if not yet submitted', async(() => {
    component.submitting = false;
    partyService.addParty.and.returnValue(new Promise(r => r(mockParty)));
    component.create();
    fixture.whenStable().then(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/party/']);
    });
  }));

});
