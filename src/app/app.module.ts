import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';

import { environment } from "../environments/environment";

import { AppComponent } from "./app.component";
import { SessionListComponent } from "./session-list/session-list.component";

import { FirebaseService } from "./services/firebase.service";
import { GameBoardService } from "./services/game-board.service";
import { GameComponent } from "./game/game.component";
import { GameService } from "./services/game.service";
import { SessionComponent } from './session/session.component';
import { CreateSessionComponent } from './session-list/create-session/create-session.component';
import { LandingComponent } from './landing/landing.component';

const appRoutes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'session-list',
    component: SessionListComponent,
    children:[
      { path: 'create-session', component: CreateSessionComponent }
    ]
  },
  { path: 'session/:sessionId/:playerId', component: SessionComponent },
  { path: 'original', component: GameComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    CreateSessionComponent,
    GameComponent,
    LandingComponent,
    SessionListComponent,
    SessionComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes
    )
  ],
  providers: [
    FirebaseService,
    GameService,
    GameBoardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
