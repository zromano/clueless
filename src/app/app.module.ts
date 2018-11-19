import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";

import { environment } from "../environments/environment";

import { AppComponent } from "./app.component";
import { GameComponent } from "./game/game.component";

import { FirebaseService } from "./services/firebase.service";
import { GameService } from "./services/game.service";

@NgModule({
  declarations: [
    AppComponent,
    GameComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
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
