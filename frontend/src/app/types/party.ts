import { PartyMenu } from './menu';

export enum PartyType {
  InGroup = 0,
  Private = 1,
}

export class Party {
  id: number;
  name: string;
  type: PartyType;
  location: string;
  leaderId: number;
  since: string;
  memberCount: number;
}

export enum PartyPhase {
  ChoosingRestaurant = 0,
  ChoosingMenu = 1,
  Ordering = 2,
  Ordered = 3,
  PaymentAndCollection = 4,
}

export class PartyState {
  id: number;
  phase: PartyPhase;
  restaurant?: number;
  members: number[];
  menus: PartyMenu[];
}
