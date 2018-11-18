import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';

import { SelectMenuComponent } from './select-menu.component';

describe('SelectMenuComponent', () => {
  let component: SelectMenuComponent;
  let fixture: ComponentFixture<SelectMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
      ],
      declarations: [ SelectMenuComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cancelRequest should emit canceled', async(() => {
    let calledCount = 0;
    component.cancel.subscribe(() => {
      calledCount += 1;
    });
    component.cancelRequest();
    fixture.whenStable().then(() => {
      expect(calledCount).toEqual(1);
    });
  }));

  it('addRequest should emit request when food and quantity', async(() => {
    component.menuId = 1;
    component.quantity = 2;
    component.loggedInUserId = 3;

    component.request.subscribe(partyMenuCreateRequest => {
      expect(partyMenuCreateRequest).toEqual({
        menuId: 1,
        quantity: 2,
        users: [3]
      });
    });
    component.addRequest();
  }));

  it('addRequest should not emit request without food or quantity', async(() => {
    component.request.subscribe(_ => expect(true).toBeFalsy());

    component.menuId = undefined;
    component.quantity = 2;
    component.loggedInUserId = 3;
    component.addRequest();

    component.menuId = 1;
    component.quantity = 0;
    component.loggedInUserId = 3;
    component.addRequest();
  }));

});
