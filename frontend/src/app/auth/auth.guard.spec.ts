import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthGuard } from './auth.guard';
import { UserService } from '../services/user.service';

class MockSnapshot extends RouterStateSnapshot {
  url: string;
  constructor(urlString: string) {
    this.url = urlString;
  }
  toString(): string {
    return this.url;
  }
}

describe('AuthGuard', () => {
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['verifyUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    });
    userService = TestBed.get(UserService);
    router = TestBed.get(Router);
  });

  it('should create', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should redirect to sign-in if not requested sign-in when not logged in',
    inject([AuthGuard], (guard: AuthGuard) => {
      userService.verifyUser.and.returnValue(new Promise(r => r(false)));
      (guard.canActivate(undefined, new MockSnapshot('/lobby')) as Promise<boolean>)
      .then(value => {
        expect(value).toBeTruthy();
        expect(router.navigate).toHaveBeenCalledWith(['/sign-in']);
      });
    })
  );

  it('should not redirect if not requested sign-in when logged in',
    inject([AuthGuard], (guard: AuthGuard) => {
      userService.verifyUser.and.returnValue(new Promise(r => r(true)));
      (guard.canActivate(undefined, new MockSnapshot('/lobby')) as Promise<boolean>)
      .then(value => {
        expect(value).toBeTruthy();
        expect(router.navigate).toHaveBeenCalledTimes(0);
      });
    })
  );

  it('should redirect to sign-in if requested sign-in when logged in',
    inject([AuthGuard], (guard: AuthGuard) => {
      userService.verifyUser.and.returnValue(new Promise(r => r(true)));
      (guard.canActivate(undefined, new MockSnapshot('/sign-in')) as Promise<boolean>)
      .then(value => {
        expect(value).toBeTruthy();
        expect(router.navigate).toHaveBeenCalledWith(['/lobby']);
      });
    })
  );

  it('should not redirect if requested sign-in when not logged in',
    inject([AuthGuard], (guard: AuthGuard) => {
      userService.verifyUser.and.returnValue(new Promise(r => r(false)));
      (guard.canActivate(undefined, new MockSnapshot('/sign-in')) as Promise<boolean>)
      .then(value => {
        expect(value).toBeTruthy();
        expect(router.navigate).toHaveBeenCalledTimes(0);
      });
    })
  );

});
