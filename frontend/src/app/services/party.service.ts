import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  Menu, PartyMenu, PartyMenuCreateRequest, PartyMenuUpdateRequest
} from '../types/menu';
import { Party, PartyState } from '../types/party';

import { Observable, of, Subscription } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PartyService {

  webSocket$: WebSocketSubject<any>;
  subscription: Subscription;

  isJoined: boolean;
  joinedPartyId: number;
  partyState: PartyState;

  @Output() partyJoin: EventEmitter<number>;
  @Output() partyLeave: EventEmitter<number>;
  @Output() partyNotJoined: EventEmitter<void>;
  @Output() partyStateUpdate: EventEmitter<PartyState>;
  @Output() partyMenuCreate: EventEmitter<PartyMenu[]>;
  @Output() partyMenuUpdate: EventEmitter<PartyMenu[]>;

  constructor(private http: HttpClient) {
    this.webSocket$ = undefined;
    this.joinedPartyId = undefined;
    this.isJoined = undefined;

    this.partyJoin = new EventEmitter();
    this.partyLeave = new EventEmitter();
    this.partyNotJoined = new EventEmitter();
    this.partyStateUpdate = new EventEmitter();
    this.partyMenuCreate = new EventEmitter();
    this.partyMenuUpdate = new EventEmitter();
  }

  async getParties(): Promise<Party[]> {
    return await this.http.get<Party[]>('api/party/', httpOptions).toPromise();
  }

  async getParty(id: number): Promise<Party> {
    if (id) {
      return await this.http.get<Party>(`api/party/${id}/`, httpOptions).toPromise();
    } else {
      return await undefined;
    }
  }

  async addParty(party: Partial<Party>): Promise<Party> {
    return await this.http.post<Party>('api/party/', party, httpOptions).toPromise();
  }

  async updateParty(party: Party): Promise<Party> {
    return await this.http.put<Party>(`api/party/${party.id}/`, party, httpOptions)
      .toPromise().then(() => party);
  }

  async deleteParty(id: number): Promise<void> {
    await this.http.delete(`api/party/${id}/`, httpOptions).toPromise();
  }

  async getMenus(): Promise<Menu[]> {
    return await this.http.get<Menu[]>(
      `api/restaurant/${this.partyState.restaurant}/menu/`
    ).toPromise();
  }

  handleWebsocket(json: any): void {
    console.log('ws:', json);
    if (json['type'] === 'party.join') {
      this.partyJoin.emit(json['user_id']);
    } else if (json['type'] === 'party.leave') {
      this.partyLeave.emit(json['user_id']);
    } else if (json['type'] === 'initial.not.joined') {
      this.isJoined = false;
      if (this.joinedPartyId) {
        this.webSocket$.next({
          'command': 'party.join',
          'party_id': this.joinedPartyId
        });
      } else {
        this.partyNotJoined.emit();
      }
    } else if (json['type'] === 'state.update') {
      this.isJoined = true;
      json['state']['restaurant'] = 1;
      const menus = [];
      for (const menuEntryId of Object.keys(json['state']['menus'])) {
        const [menuId, quantity, userIds] = json['state']['menus'][menuEntryId];
        menus.push({
          id: +menuEntryId,
          menuId: menuId,
          quantity: quantity,
          userIds: userIds
        });
      }
      this.partyState = {
        id: json['state']['id'],
        phase: json['state']['phase'],
        restaurant: json['state']['restaurant'],
        members: json['state']['members'],
        menus: menus
      };
      this.joinedPartyId = json['state']['id'];
      console.log(this.partyState);
      this.partyStateUpdate.emit(this.partyState);
    } else if (json['type'] === 'menu.create') {
      this.partyState.menus.push({
        id: json['menu_entry_id'],
        menuId: json['menu_id'],
        quantity: json['quantity'],
        userIds: json['users']
      });
      this.partyMenuCreate.emit(this.partyState.menus);
    } else if (json['type'] === 'menu.update') {
      const menu_entries = this.partyState.menus.filter(
        partyMenu => partyMenu.id === json['menu_entry_id']
      );
      if (menu_entries.length > 0) {
        const menu_entry = menu_entries[0];
        menu_entry.quantity += json['quantity'];
        menu_entry.userIds = menu_entry.userIds
          .concat(json['add_user_ids']);
        menu_entry.userIds = menu_entry.userIds
          .filter(userId => json['remove_user_ids'].every(
            targetUserId => userId !== targetUserId
          ));
        console.log(this.partyState.menus);
        this.partyMenuUpdate.emit(this.partyState.menus);
      }
    }
  }

  connectWebsocket(): void {
    if (this.webSocket$ === undefined) {
      console.log('ws connected!');
      this.webSocket$ = new WebSocketSubject('ws://localhost:8000/ws/party/');
      this.subscription = this.webSocket$.subscribe(json => this.handleWebsocket(json));
      this.isJoined = undefined;
    } else if (this.isJoined === false && this.joinedPartyId) {
      this.webSocket$.next({
        'command': 'party.join',
        'party_id': this.joinedPartyId
      });
      this.isJoined = undefined;
    }
  }

  leaveParty(): void {
    this.webSocket$.next({
      'command': 'party.leave',
      'party_id': this.joinedPartyId
    });
    this.joinedPartyId = 0;

    this.subscription.unsubscribe();
    this.webSocket$ = undefined;
  }

  createMenu(request: PartyMenuCreateRequest) {
    this.webSocket$.next({
      'command': 'menu.create',
      'menu_id': request.menuId,
      'quantity': request.quantity,
      'users': request.users
    });
  }

  updateMenu(request: PartyMenuUpdateRequest) {
    this.webSocket$.next({
      'command': 'menu.update',
      'menu_entry_id': request.id,
      'quantity': request.quantityDelta,
      'add_user_ids': request.addUserIds,
      'remove_user_ids': request.removeUserIds,
    });
    console.log(request);
  }

}
