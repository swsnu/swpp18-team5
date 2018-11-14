import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Party } from '../types/party';

@Component({
  selector: 'app-lobby-list-item',
  templateUrl: './lobby-list-item.component.html',
  styleUrls: ['./lobby-list-item.component.css']
})
export class LobbyListItemComponent implements OnInit {

  @Input() party: Party;

  @Output() join: EventEmitter<Party> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  joinParty(party: Party) {
    this.join.emit(party);
  }
}
