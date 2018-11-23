import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Party, PartyState } from '../types/party';
import { UserService } from '../services/user.service';
import { PartyService } from '../services/party.service';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.css']
})
export class PartyComponent implements OnInit {
  party: Party;
  state: PartyState;
  id: number;

  constructor(
    private partyService: PartyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.state = {
      id: -1,
      phase: -1,
      restaurant: null,
      members: [],
      menus: []
    };

    this.joinParty();
    this.getParty();
    this.partyService.connectWebsocket();
    this.partyService.partyStateUpdate.subscribe(state => {
      this.state = state;
      this.getParty();
    });
  }

  getParty(): void {
    this.id = this.partyService.joinedPartyId;
    this.partyService.getParty(this.id)
      .then(party => {
        this.party = party;
      });
  }

  joinParty(): void {
    this.partyService.connectWebsocket();
  }

  leaveParty(): void {
    this.partyService.leaveParty();
    this.router.navigate(['/lobby/']);
  }
}
