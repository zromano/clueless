import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import * as _ from "lodash";

import { Session } from "../models/session";
import { Player } from "../models/player";
import { Event } from "../models/event";

import { FirebaseService } from "../services/firebase.service";
import * as $ from "jquery";
import { Suspects, Weapons, Rooms } from '../share/constants';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
  sessionId: string;
  playerId: string;
  currPlayer: Player;
  events$: Observable<Event[]>;
  players$: Observable<Player[]>;
  session$: Observable<Session>;
  session: Session;
  selectedRole: string;
  isHost: boolean;
  selectedMove: string;
  availableMoves: string[];

  rooms: string[];
  suspects: string[];
  weapons: string[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService
  ) {
    this.rooms = _.map(Rooms, "name");
    this.suspects = _.map(Suspects, "name");
    this.weapons = _.map(Weapons, "name");

    //TODO: Update with actual available moves
    this.availableMoves = ["Study", "Library", "Hallway"];
  }

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId');
    this.playerId = this.route.snapshot.paramMap.get('playerId');

    this.firebaseService.setSessionId(this.sessionId);
    this.firebaseService.setPlayerId(this.playerId);

    this.session$ = this.firebaseService.sessionRef().valueChanges();

    this.firebaseService.sessionRef().valueChanges().subscribe(session => {
      this.session = session;
    });
    this.firebaseService.playerRef().valueChanges().subscribe(player => {
      this.currPlayer = player;
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

  selectRole() {
    this.firebaseService.playerRef().update({ role: this.selectedRole });

    var updatedAvailableRoles = [];
    var selectedRole = this.selectedRole;

    this.session.availableRoles.forEach(function(aRole) {
      if (aRole != selectedRole) {
        updatedAvailableRoles.push(aRole);
      }
    })

    $("#selectRoleBtn").prop('disabled', true);

    this.firebaseService.addEvent("Player (" + this.playerId + ") has selected role: " + selectedRole );
    this.firebaseService.sessionRef().update({ availableRoles: updatedAvailableRoles });
    console.log(this.selectedRole);
  }

  initiateSession(playerObjs) {
    var playerArrMutable = Object.keys(playerObjs);
    var suspects = this.shuffle(Suspects.slice());
    var rooms = this.shuffle(Rooms.slice());
    var weapons = this.shuffle(Weapons.slice());

    var confidential = {
      suspect: suspects.pop().name,
      room: rooms.pop().name,
      weapon: weapons.pop().name,
    };

    this.shuffle(playerArrMutable);

    // playerIdArr = ["hi", "bye"];s
    console.log(playerArrMutable);
    console.log(playerArrMutable.length);

    this.firebaseService.sessionRef().update({
      confidential: confidential
    })

    // deal cards
    var rotatingPlayers = playerArrMutable.slice();

    var playerSuspectCards = {};
    var playerRoomCards = {};
    var playerWeaponCards = {};

    while(suspects.length > 0) {
      if (playerSuspectCards[rotatingPlayers[0]] != null) {
        playerSuspectCards[rotatingPlayers[0]].push(suspects.pop().name);
      } else {
        playerSuspectCards[rotatingPlayers[0]] = [suspects.pop().name];
      }

      rotatingPlayers = this.rotate(rotatingPlayers);
    }

    while(rooms.length > 0) {
      if (playerRoomCards[rotatingPlayers[0]] != null) {
        playerRoomCards[rotatingPlayers[0]].push(rooms.pop().name);
      } else {
        playerRoomCards[rotatingPlayers[0]] = [rooms.pop().name];
      }

      rotatingPlayers = this.rotate(rotatingPlayers);
    }

    while(weapons.length > 0) {
      if (playerWeaponCards[rotatingPlayers[0]] != null) {
        playerWeaponCards[rotatingPlayers[0]].push(weapons.pop().name);
      } else {
        playerWeaponCards[rotatingPlayers[0]] = [weapons.pop().name];
      }

      rotatingPlayers = this.rotate(rotatingPlayers);
    }

    var updatedAvailableRoles = this.session.availableRoles.slice();
    var turnOrder = [];

    playerArrMutable.forEach((function(id) {
      this.firebaseService.playerRef(id).update({
        cards: {
          rooms: playerRoomCards[id],
          suspects: playerSuspectCards[id],
          weapons: playerWeaponCards[id]
        }
      });

      if (playerObjs[id].role == "") {
        var role = updatedAvailableRoles.pop();
        this.firebaseService.playerRef(id).update({
          role: role
        });

        turnOrder.push(role);
      } else {
        turnOrder.push(playerObjs[id].role);
      }
    }).bind(this));



    this.firebaseService.sessionRef().update({
      status: "IN PROGRESS",
      availableRoles: updatedAvailableRoles,
      turnOrder: turnOrder,
      currentTurn: turnOrder[0]
    })

    console.log(playerSuspectCards);
    console.log(playerRoomCards);
    console.log(playerWeaponCards);
  }
  startSession() {
    this.firebaseService.playersRef().get().toPromise().then( (function(obj) {
      var playerObjSnapshot = {};
      obj.docs.forEach(function (doc) {
        playerObjSnapshot[doc.id] = doc.data();
      })

      this.initiateSession(playerObjSnapshot);
    }).bind(this))
  }

  makeMove() {
    var updatedTurnOrder = this.rotate(this.session.turnOrder);
    console.log(updatedTurnOrder);

    this.firebaseService.sessionRef().update({
      turnOrder: updatedTurnOrder,
      currentTurn: updatedTurnOrder[0]
    });
  }

  //move first element to end
  rotate(array) {
    var arrayCopy = array;
    arrayCopy.push(arrayCopy.shift());
    return arrayCopy;
  }

  // from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  shuffle(array) {
    var arrayCopy = array;
    var currentIndex = arrayCopy.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = arrayCopy[currentIndex];
      arrayCopy[currentIndex] = arrayCopy[randomIndex];
      arrayCopy[randomIndex] = temporaryValue;
    }
    return arrayCopy;
  }
}
