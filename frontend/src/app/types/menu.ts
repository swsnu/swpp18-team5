export class Menu {
  id: number;
  name: string;
  price: number;
}

export class PartyMenuCreateRequest {
  menuId: number;
  quantity: number;
  users: number[];
}

export class PartyMenuUpdateRequest {
  id: number;
  quantityDelta: number;
  addUserIds: number[];
  removeUserIds: number[];
}
