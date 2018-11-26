import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Session } from "../models/session";
import { Player } from "../models/player";
import { Event } from "../models/event";

import { FirebaseService } from "../services/firebase.service";

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
  sessionId: string;
  playerId: string;
  events$: Observable<Event[]>;
  players$: Observable<Player[]>;
  session$: Observable<Session>;
  session: Session;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId');
    this.playerId = this.route.snapshot.paramMap.get('sessionId');

    this.firebaseService.setSessionId(this.sessionId);
    this.firebaseService.setPlayerId(this.playerId);
    
    this.session$ = this.firebaseService.sessionRef().valueChanges();

    this.firebaseService.sessionRef().valueChanges().subscribe(session => {
      this.session = session;
    });

    this.players$ = this.firebaseService.playersRef().snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Player;
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
    this.events$ = this.firebaseService.eventRef().valueChanges();

  }
}
