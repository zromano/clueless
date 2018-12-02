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
import { Suspects, Weapons, Rooms, Positions } from '../share/constants';
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
  gameBoard: {};

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
      this.gameBoard = session.gameBoard;
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


    // Set starting Position
    var suspectList = Suspects;
    var startPosition = "";

    suspectList.forEach(function (arrayItem) {
      var curSuspect = arrayItem.name;
      if (curSuspect === selectedRole){
        console.log("Starting Position for " + curSuspect + " is: " + arrayItem.position);
        startPosition = arrayItem.position;
      }
    });
    // find space in starting room
    var startingRoomSpace = Positions[startPosition].uiCoords[0];
    
    this.firebaseService.playerRef().update({ 
      position: startPosition
      xPos: startingRoomSpace.x;
      yPos: startingRoomSpace.y;
    });


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
      currentTurn: turnOrder[0],
      gameBoard: Positions
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

    // get possible moves for first player
  }

  getPossibleMoves() {
    var curPos = this.currPlayer.position;
    var validMoves = ["Error"];

    if (this.gameBoard.hasOwnProperty(curPos)) {
      validMoves = this.gameBoard[curPos].validMoves;
      var i = validMoves.length;
      while (i--) {
          var curPosToCheck = validMoves[i];
          if (this.gameBoard[curPosToCheck].type === "hallway" && this.gameBoard[curPosToCheck].uiCoords[0].isOccupied){
              validMoves.splice(i, 1);
          } 
      }
    }
    this.availableMoves = validMoves;
    return validMoves;
  }

  makeMove() {
    var updatedTurnOrder = this.rotate(this.session.turnOrder);
    console.log(updatedTurnOrder);

    // marking comingfrom position empty
    var curX = this.currPlayer.xPos;
    var curY = this.currPlayer.yPos;
    var curPos = this.currPlayer.position;

    //loop through coords in current room to find match
    var i = this.gameBoard[curPos].uiCoords.length;
    while (i--) {
        var curPosToCheck = this.gameBoard[curPos].uiCoords[i];
        if (curPosToCheck.x == curX && curPosToCheck.y == curY){
          this.gameBoard[curPos].uiCoords[i].isOccupied = false;
          break;
      }
    }

    // will need to loop through possible positions to find open one
    // this.gameBoard[this.selectedMove].uiCoords.forEach(function (space, index) {
    
    this.sendPlayerToRoom(this.selectedMove);

    this.firebaseService.sessionRef().update({
      turnOrder: updatedTurnOrder,
      currentTurn: updatedTurnOrder[0],
      gameBoard: this.gameBoard
    });
  }

  sendPlayerToRoom(targetRoom){
    var i = this.gameBoard[targetRoom].uiCoords.length;
    var curX = 0;
    var curY = 0;
    while (i--) {
        var curPosToCheck = this.gameBoard[targetRoom].uiCoords[i];

        if (curPosToCheck.isOccupied == false){
          this.gameBoard[targetRoom].uiCoords[i].isOccupied = true;
          curX = curPosToCheck.x;
          curY = curPosToCheck.y;
          break;
      }
    }

    this.firebaseService.playerRef().update({
      position: this.selectedMove,
      xPos: curX,
      yPos: curY
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
