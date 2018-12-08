import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import * as _ from "lodash";

import { Session } from "../models/session";
import { Player } from "../models/player";
import { Event } from "../models/event";
import { Suggestion } from '../models/suggestion';
import { Accusation } from '../models/accusation';

import { FirebaseService } from "../services/firebase.service";
import { GameBoardService } from "../services/game-board.service";

declare var jquery:any;
declare var $ :any;
import { Suspects, Weapons, Rooms, Positions } from '../share/constants';
import { forEach } from '@angular/router/src/utils/collection';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
  globalAlerts: SafeHtml;
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
  gameBoard: {};
  suggestion: Suggestion;
  accusation: Accusation;
  lastGlobalAlert: string;
  suggestionSuspectList: string[];
  suspectPositions: any;
  weaponPositions: any;
  disableSuggestBtn: boolean;

  rooms: string[];
  suspects: string[];
  weapons: string[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService,
    private sanitizer: DomSanitizer,
    private gameBoardService: GameBoardService
  ) {
    this.rooms = _.map(Rooms, "name");
    this.suspects = _.map(Suspects, "name");
    this.weapons = _.map(Weapons, "name");
  }

  ngOnInit() {
    window.scrollTo(0, 0)

    this.gameBoardService.initBoard();

    this.sessionId = this.route.snapshot.paramMap.get('sessionId');
    this.playerId = this.route.snapshot.paramMap.get('playerId');

    this.firebaseService.setSessionId(this.sessionId);
    this.firebaseService.setPlayerId(this.playerId);

    this.session$ = this.firebaseService.sessionRef().valueChanges();

    this.firebaseService.playerRef().valueChanges().subscribe(player => {
      this.currPlayer = player;
      this.selectedRole = player.role;

      // Remove player from list of suspects
      this.suggestionSuspectList = _.without(this.suspects, player.role);
    });

    this.firebaseService.sessionRef().valueChanges().subscribe(session => {
      this.session = session;
      this.gameBoard = session.gameBoard;
      if (session.lastGlobalAlert != null && this.lastGlobalAlert != session.lastGlobalAlert) {
        this.lastGlobalAlert = session.lastGlobalAlert;

        this.addAlert(this.lastGlobalAlert);
      };

      this.suspectPositions = session.suspects;
      this.weaponPositions = session.weapons;

      // Update positons of players on board
      for (let suspect of Object.keys(session.suspects)) {
        var position = session.suspects[suspect].coordinate.split(",").map(Number);
        this.gameBoardService.movePlayer(suspect, position[0], position[1]);
      }

      // Update positons of weapons on board
      for (let weapon of Object.keys(session.weapons)) {
        var position = session.weapons[weapon].split(",").map(Number);
        this.gameBoardService.moveWeapon(weapon, position[0], position[1]);
      }

      // Player current turn
      if (this.currPlayer && session.currentTurn == this.currPlayer.role && this.suspectPositions) {
        var currentPosition = this.suspectPositions[this.currPlayer.role].position;
        if (currentPosition === "" || currentPosition.startsWith("Hallway")) {
          this.disableSuggestBtn = true;
        }

        // If turn order is curr player and curr player has already made a false accusation, then skip
        if (this.currPlayer.noTurn) {
          console.log("skipped " + this.currPlayer.role);
          this.updateTurnOrder();
        }

        if (session.status == 'IN PROGRESS' && this.currPlayer.noTurn == false) {
          this.firebaseService.playersRef().get().toPromise().then( (function(obj) {
            var playerObjSnapshot = {};

            var otherThanCurrPlayerStillPlaying = false;

            obj.docs.forEach((function (doc) {
              playerObjSnapshot[doc.id] = doc.data();

              var play = doc.data() as Player;

              if (play.role != this.currPlayer.role && play.noTurn == false) {
                otherThanCurrPlayerStillPlaying = true;
              }
            }).bind(this));

            if (otherThanCurrPlayerStillPlaying == false) {
              this.firebaseService.addEvent(this.currPlayer.role + " Wins!");
              this.firebaseService.sessionRef().update({
                status: "FINISHED"
              });
            }
          }).bind(this));
        }
      }

      if (session.status == 'FINISHED') {
        $('#gameOverModal').modal('show');
      }
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

    this.events$.subscribe(event => {
      // play is a correct function here
      var audioPlayer = <HTMLVideoElement>document.getElementById("ping");
      audioPlayer.play();
    })

    this.resetSuggestionForm();

    this.accusation = {
      room: "",
      suspect: "",
      weapon: ""
    }
  }

  addAlert(text) {
    var newAlert =
      "<div class='alert alert-warning alert-dismissible fade show' role='alert' style='margin-bottom: 0px;'>" +
      text +
      "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" +
      "</div>";
    this.globalAlerts = this.sanitizer.bypassSecurityTrustHtml(newAlert);
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

    this.firebaseService.addEvent("New Player Joined: " + selectedRole);
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

    var initialPositions = Suspects.slice();
    var suspectPositions = {};
    initialPositions.forEach (function (suspect) {
      suspectPositions[suspect["name"]] = suspect["position"];
    });

    var gameBoard = Positions;

    playerArrMutable.forEach((function(id) {
      var role;
      this.firebaseService.playerRef(id).update({
        cards: {
          rooms: playerRoomCards[id],
          suspects: playerSuspectCards[id],
          weapons: playerWeaponCards[id]
        }
      });

      if (playerObjs[id].role == "") {
        role = updatedAvailableRoles.pop();
        this.firebaseService.playerRef(id).update({
          role: role
        });

        turnOrder.push(role);
      } else {
        role = playerObjs[id].role;
        turnOrder.push(playerObjs[id].role);
      }
    }).bind(this));

    this.firebaseService.sessionRef().update({
      status: "IN PROGRESS",
      availableRoles: updatedAvailableRoles,
      turnOrder: turnOrder,
      currentTurn: turnOrder[0],
      gameBoard: gameBoard
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

  getPossibleMoves() {
    var curPos = this.session.suspects[this.selectedRole].position;
    var validMoves = ["No Moves Available"];

    if (curPos === "") {
      // First Move
      validMoves = _.filter(Suspects, ['name', this.selectedRole])[0].startOptions;
    } else if (this.gameBoard.hasOwnProperty(curPos)) {
      validMoves = this.gameBoard[curPos].validMoves;
      var i = validMoves.length;
      while (i--) {
        var curPosToCheck = validMoves[i];
        if (this.gameBoard[curPosToCheck].type === "hallway" && this.gameBoard[curPosToCheck].uiCoords[0].isOccupied) {
          validMoves.splice(i, 1);
        }
      }
    }

    return validMoves;
  }

  makeSuggestion() {
    console.log(this.suggestion);
    this.suggestion.room = this.session.suspects[this.selectedRole].position;
    var checkArr = this.session.turnOrder.slice();
    checkArr.shift()
    this.suggestion.checkArr = checkArr;

    var suspectCoord = this.session.suspects[this.suggestion.suspect].coordinate.split(",").map(Number);
    var suspectX = suspectCoord[0];
    var suspectY = suspectCoord[1];
    var suspectPos = this.session.suspects[this.suggestion.suspect].position;

    console.log("Suspect Coordinates: " + suspectX + "," + suspectY + "," + suspectPos);

    var currGameboard = JSON.parse(JSON.stringify(this.gameBoard));

    if (suspectPos) {
      // Mark previous suspect position as unoccupied
      var i = currGameboard[suspectPos].uiCoords.length;
      while (i--) {
        var curPosToCheck = currGameboard[suspectPos].uiCoords[i];
        if (curPosToCheck.x == suspectX && curPosToCheck.y == suspectY) {
          currGameboard[suspectPos].uiCoords[i].isOccupied = false;
          break;
        }
      }
    }

    this.sendPlayerToRoom(this.suggestion.suspect, this.suggestion.room, currGameboard);
    this.sendWeaponToRoom(this.suggestion.weapon, this.suggestion.room, currGameboard);

    this.firebaseService.sessionRef().update({
      suggestionInProgess: this.suggestion
    }).then((function() {
      var outer = function(sessionInstance) {
        setTimeout(function() {
          var suggestionListener = sessionInstance.session.suggestionInProgess;
          if (suggestionListener.cardShown == null && suggestionListener.checkArr.length > 0) {
            outer(sessionInstance);
          } else {
            var card = suggestionListener.cardShown;
            if (card != null && card != "") {
              sessionInstance.firebaseService.sessionRef().update({
                cardShown: sessionInstance.session.cardsShown.push(card),
                lastGlobalAlert: "Card Shown: " + card
              });

              sessionInstance.firebaseService.addEvent("New card shown: " + card);
            } else {
              sessionInstance.firebaseService.addEvent("Suggestion (" + suggestionListener.room + ", " + suggestionListener.suspect + ", " + suggestionListener.weapon + ") Not Refuted");
            }

            sessionInstance.firebaseService.sessionRef().update({
              suggestionInProgess: null
            });
          }
        }, 500);
      };

      outer(this);
    }).bind(this));

    $('#suggestCollapse').removeClass('show');
    $("#suggestBtn").prop('disabled', true);
  }

  suggestionShowCard() {
    this.firebaseService.sessionRef().update({
      suggestionInProgess: this.session.suggestionInProgess
    });
  }

  suggestionNoCard() {
    var suggestion = this.session.suggestionInProgess;
    suggestion.checkArr.shift()

    this.firebaseService.sessionRef().update({
      suggestionInProgess: suggestion
    });
  }

  resetSuggestionForm() {
    this.suggestion = {
      playerId: this.playerId,
      room: "",
      suspect: "",
      weapon: "",
      checkArr: [],
      cardShown: null
    };
  }

  makeAccusation(){
    console.log(this.accusation);

    var confidentialCard = this.session.confidential;

    if (this.accusation.room == confidentialCard.room && this.accusation.weapon == confidentialCard.weapon && this.accusation.suspect == confidentialCard.suspect) {
      this.firebaseService.addEvent("Accusation (" + this.accusation.room + ", " + this.accusation.weapon + ", " + this.accusation.suspect + ") is Correct");
      this.firebaseService.addEvent(this.currPlayer.role + " Wins!");
      this.firebaseService.sessionRef().update({
        status: "FINISHED"
      });
    } else {
      //need to write code to remove player from turn order and update turn order
      this.firebaseService.playerRef().update({
        noTurn: true
      }).then((function(){
        this.updateTurnOrder();
        $('#accusationModal').modal('show');
      }).bind(this));
    }

    $('#accuseCollapse').removeClass('show');
    $("#accuseBtn").prop('disabled', true);
  }

  updateTurnOrder() {
    var updatedTurnOrder = this.rotate(this.session.turnOrder);
    console.log(updatedTurnOrder);

    this.firebaseService.sessionRef().update({
      turnOrder: updatedTurnOrder,
      currentTurn: updatedTurnOrder[0]
    });
  }

  endTurn() {
    var updatedTurnOrder = this.rotate(this.session.turnOrder);
    console.log(updatedTurnOrder);

    this.firebaseService.sessionRef().update({
      turnOrder: updatedTurnOrder,
      currentTurn: updatedTurnOrder[0]
    });
  }

  makeMove() {
    // marking comingfrom position empty
    var curCoord = this.session.suspects[this.selectedRole].coordinate.split(",").map(Number);
    var curX = curCoord[0];
    var curY = curCoord[1];
    var curPos = this.session.suspects[this.selectedRole].position;
    var currGameboard = JSON.parse(JSON.stringify(this.gameBoard));

    if (curPos) {
      //loop through coords in current room to find match
      var i = currGameboard[curPos].uiCoords.length;
      while (i--) {
        var curPosToCheck = currGameboard[curPos].uiCoords[i];
        if (curPosToCheck.x == curX && curPosToCheck.y == curY) {
          currGameboard[curPos].uiCoords[i].isOccupied = false;
          break;
        }
      }
    }

    this.firebaseService.addEvent(this.selectedRole + " moved to " + this.selectedMove);
    this.sendPlayerToRoom(this.selectedRole, this.selectedMove, currGameboard);

    $('#moveCollapse').removeClass('show');
    $("#moveBtn").prop('disabled', true);

    if (this.currPlayer && this.session.currentTurn == this.currPlayer.role && this.suspectPositions) {
      var currentPosition = this.suspectPositions[this.currPlayer.role].position;
      if (currentPosition !== "" && ! currentPosition.startsWith("Hallway")) {
        this.disableSuggestBtn = false;
      }
    }
  }

  sendPlayerToRoom(name, targetRoom, gameBoard) {
    var i = gameBoard[targetRoom].uiCoords.length;
    var curX = 0;
    var curY = 0;
    while (i--) {
      var curPosToCheck = gameBoard[targetRoom].uiCoords[i];

      if (curPosToCheck.isOccupied == false) {
        gameBoard[targetRoom].uiCoords[i].isOccupied = true;
        curX = curPosToCheck.x;
        curY = curPosToCheck.y;
        break;
      }
    }

    this.gameBoardService.movePlayer(name, curX, curY);

    var coordString = curX + "," + curY;
    this.suspectPositions[name] = {
      position: targetRoom,
      coordinate: coordString
    };

    this.firebaseService.sessionRef().update({
      gameBoard: gameBoard,
      suspects: this.suspectPositions
    });
  }

  sendWeaponToRoom(weapon, targetRoom, gameBoard) {
    var i = gameBoard[targetRoom].uiCoords.length;
    var curX = 0;
    var curY = 0;

    while (i--) {
      var curPosToCheck = gameBoard[targetRoom].uiCoords[i];

      if (curPosToCheck.isOccupied == false) {
        gameBoard[targetRoom].uiCoords[i].isOccupied = true;
        curX = curPosToCheck.x;
        curY = curPosToCheck.y;
        break;
      }
    }

    this.gameBoardService.moveWeapon(weapon, curX, curY);

    var coordString = curX + "," + curY;
    this.weaponPositions[weapon] = coordString;

    this.firebaseService.sessionRef().update({
      gameBoard: gameBoard,
      weapons: this.weaponPositions
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
