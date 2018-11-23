import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { LobbyListItemComponent } from './lobby-list-item/lobby-list-item.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { LobbyComponent } from './lobby/lobby.component';
import { PartyCreateComponent } from './party-create/party-create.component';
import { PartyComponent } from './party/party.component';
import { PartyChoosingMenuComponent } from './party-choosing-menu/party-choosing-menu.component';
import { PartyChoosingRestaurantComponent } from './party-choosing-restaurant/party-choosing-restaurant.component';
import { PartyOrderingComponent } from './party-ordering/party-ordering.component';
import { PartyOrderedComponent } from './party-ordered/party-ordered.component';
import { PartyPaymentComponent } from './party-payment/party-payment.component';
import { SelectMenuComponent } from './party-choosing-menu/select-menu/select-menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    LobbyListItemComponent,
    SignInComponent,
    LobbyComponent,
    PartyCreateComponent,
    PartyComponent,
    PartyChoosingMenuComponent,
    PartyChoosingRestaurantComponent,
    PartyOrderingComponent,
    PartyOrderedComponent,
    PartyPaymentComponent,
    SelectMenuComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken'
    }),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
