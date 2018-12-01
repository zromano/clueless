import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RouterModule, Routes, Router} from '@angular/router';

import { Session } from "../models/session";

import { FirebaseService } from "../services/firebase.service";
import { GameService } from "../services/game.service";

@Component({
  selector: 'session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent implements OnInit {
  sessions$: Observable<Session[]>;

  constructor(
    private gameService: GameService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sessions$ = this.firebaseService.gameRef().snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Session;
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  joinSession(session){
    var sessionId = session.id;
    this.firebaseService.setSessionId(sessionId);

    var playerId = this.gameService.addPlayer();
    this.router.navigate(['/session', sessionId, playerId]);
  }
}
