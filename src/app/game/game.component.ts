import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";

import * as _ from "lodash";
import { Event } from "../models/event";
import { Player } from "../models/player";
import { Session } from "../models/session";
import { Rooms, Suspects, Weapons } from "../share/constants";

import { FirebaseService } from "../services/firebase.service";
import { GameService } from "../services/game.service";

@Component({
  selector: "clue-less",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"]
})
export class GameComponent implements OnInit {

  playerList: string[];
  selectedPlayer: string;
  session: Session;
  sessionName: string;
  hostName: string;


  events$: Observable<Event[]>;
  player$: Observable<Player>;

  constructor(
    private firebaseService: FirebaseService,
    private gameService: GameService
  ) {
    this.playerList = _.map(Suspects, "name");

    // TODO: Colonel Mustard is currently set as the default user when the session is created
    this.playerList = _.without(this.playerList, "Colonel Mustard");

    this.selectedPlayer = this.playerList[0];
  }

  ngOnInit() {}

  // moveUp(){
  //   movePlayer(0)
  // }
  // moveRight(){
  //   movePlayer(1)
  // }
  // moveDown(){
  //   movePlayer(2)
  // }
  // moveLeft(){
  //   movePlayer(3)
  // }

  // private movePlayer(var dirToMove) {
  //   this.gameService.move(this.selectedPlayer, dirToMove)


  // }


  addPlayer() {
    this.gameService.addPlayer(this.selectedPlayer, this.session.turnOrder);

    // Update drop-down selection to remove player from remaining options
    this.playerList = _.without(this.playerList, this.selectedPlayer);
    this.selectedPlayer = this.playerList[0];
  }

  createSession() {
    this.gameService.createSession(this.sessionName, this.hostName);

    this.events$ = this.firebaseService.eventRef().valueChanges();
    this.player$ = this.firebaseService.playerRef().valueChanges();

    this.firebaseService.sessionRef().valueChanges().subscribe(session => {
      this.session = session;
    });
  }

  startSession() {
    var playerIds = this.session.turnOrder;
    this.gameService.assignCards(playerIds);
  }
}
