from django.core.cache import cache
from enum import IntEnum
import json


class CacheModel():
    _key = 'key'

    @classmethod
    def key(cls, id):
        return '{}:{}'.format(cls._key, id)

    @classmethod
    def get(cls, id: int):
        return cache.get(cls.key(id))

    def save(self):
        cache.set(self.key(self.id), self.as_dict())

    def delete(self):
        cache.delete(self.key(self.id))

    def refresh_from_db(self):
        pass


class PartyPhase(IntEnum):
    ChoosingRestaurant = 0
    ChoosingMenu = 1
    Ordering = 2
    Ordered = 3
    PaymentAndCollection = 4


class PartyState(CacheModel):
    _key = 'party'

    def __init__(self, party_id: int):
        self.id = party_id
        self.phase = PartyPhase.ChoosingRestaurant
        self.restaurant_id = None
        self.restaurant_votes = []
        self.member_ids = []
        self.member_ids_backup = []
        self.paid_user_id = None
        self.menu_entries = MenuEntries()
        self.menu_confirmed_user_ids = []

    @classmethod
    def get(cls, id: int):
        o = super().get(id)
        if o is None:
            return None

        self = PartyState(o['id'])
        self.refresh_from_db()

        return self

    def refresh_from_db(self):
        super().refresh_from_db()
        o = super().get(self.id)
        self.phase = o.get('phase', PartyPhase.ChoosingRestaurant)
        self.restaurant_id = o.get('restaurant_id', None)
        self.restaurant_votes = o.get('restaurant_votes', [])
        self.member_ids = o.get('member_ids', [])
        self.member_ids_backup = o.get('member_ids_backup', [])
        self.paid_user_id = o.get('paid_user_id', None)
        self.menu_entries = MenuEntries.from_dict(o['menu_entries'])
        self.menu_confirmed_user_ids = o.get('menu_confirmed_user_ids', [])

    def as_dict(self):
        return {
            'id': self.id,
            'phase': self.phase,
            'restaurant_id': self.restaurant_id,
            'restaurant_votes': self.restaurant_votes,
            'member_ids': self.member_ids,
            'member_ids_backup': self.member_ids_backup,
            'paid_user_id': self.paid_user_id,
            'menu_entries': self.menu_entries.as_dict() if isinstance(
                self.menu_entries, MenuEntries) else self.menu_entries,
            'menu_confirmed_user_ids': self.menu_confirmed_user_ids,
        }


class MenuEntries:
    last_id = 0
    inner = {}

    def __init__(self):
        self.last_id = 0
        self.inner = {}

    @classmethod
    def from_dict(cls, d: dict):
        o = cls()
        if d is not None and len(d) > 0:
            o.inner = d
            o.last_id = max(d.keys())
        return o

    def as_dict(self):
        return self.inner

    def add(self, menu_id: int, quantity: int, user_ids: list):
        id = self.last_id + 1
        self.inner[id] = ((menu_id, quantity, user_ids))
        self.last_id = id
        return id

    def delete(self, menu_entry_id: int):
        return self.inner.pop(menu_entry_id)

    def get(self, menu_entry_id: int, default=None):
        return self.inner.get(menu_entry_id, default)

    def remove_user(self, user_id: int):
        for k in self.inner:
            (m, q, ul) = self.inner[k]
            ul = [u for u in ul if u != user_id]
            self.inner[k] = (m, q, ul)

    def update(self, menu_entry_id: int, quantity: int, add_user_ids=[], remove_user_ids=[]):
        (m, q, ul) = self.inner[menu_entry_id]
        q += quantity
        ul.extend(add_user_ids)
        for u in remove_user_ids:
            ul.remove(u)
        self.inner[menu_entry_id] = (m, q, ul)
        return self.inner[menu_entry_id]

    def __getitem__(self, key):
        return self.inner[key]
