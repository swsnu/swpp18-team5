import { Component, OnInit } from '@angular/core';
import { Party } from '../types/party';
import { PartyService } from '../services/party.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  parties: Party[];

  constructor(
    private partyService: PartyService,
    private userService: UserService,
    private router: Router,
  ) { }

  ngOnInit() {
    if (this.userService.getSignedInUsername() == null) {
      this.router.navigate(['/sign-in']);
    } else {
      this.getParties();
    }
  }

  getParties(): void {
    this.partyService.getParties().then(parties => this.parties = parties);
  }

  createParty(): void {
    this.router.navigate(['/party/new']);
  }

  onJoinParty(party: Party): void {
    this.partyService.joinParty(party.id);
  }
}
