import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      const url: string = state.url;
      if (url === '/sign-in') {
        return this.userService.verifyUser().then(success => {
          if (success) {
            this.router.navigate(['/lobby']);
          }
          return true;
        });
      } else {
        return this.userService.verifyUser().then(success => {
          if (!success) {
            this.router.navigate(['/sign-in']);
          }
          return true;
        });
      }
  }
}
