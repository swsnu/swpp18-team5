import { Injectable, EventEmitter } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';

import { environment } from '../../environments/environment';

import { Command, serializeCommand } from '../types/command';
import { Event, deserializeEvent } from '../types/event';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public onEvent: EventEmitter<Event> = new EventEmitter();

  websocket$: WebSocketSubject<any>;

  constructor() { }

  isConnected(): boolean {
    return this.websocket$ !== undefined && !this.websocket$.closed;
  }

  connect(): void {
    if (this.websocket$ === undefined) {
      const protocol = window.location.protocol.replace('http', 'ws');
      const host = window.location.host;
      this.websocket$ = new WebSocketSubject(`${protocol}//${host}${environment.wsUrl}party/`);
      this.websocket$.subscribe(json => this.receive(json));
    }
  }

  disconnect(): void {
    this.websocket$ = undefined;
  }

  receive(json: any): void {
    if (!environment.production) {
      console.log('ws-recv: ', json);
    }
    const event = deserializeEvent(json);
    this.onEvent.emit(event);
  }

  send(command: Command): void {
    if (!this.isConnected()) {
      return;
    }

    const json = serializeCommand(command);
    if (!environment.production) {
      console.log('ws-send: ', json);
    }
    this.websocket$.next(json);
  }
}
