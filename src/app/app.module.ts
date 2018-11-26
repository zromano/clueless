import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";

import { environment } from "../environments/environment";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from './app-routing.module';
import { FirebaseService } from "./services/firebase.service";
import { GameBoardComponent } from './game-board/game-board.component';
import { GameComponent } from "./game/game.component";
import { GameService } from "./services/game.service";

@NgModule({
  declarations: [
    AppComponent,
    GameBoardComponent,
    GameComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AppRoutingModule,
    BrowserModule,
    FormsModule
  ],
  providers: [
    FirebaseService,
    GameService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
