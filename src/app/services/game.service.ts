import { Injectable } from '@angular/core';

import * as _ from "lodash";
import { Rooms, Suspects, Weapons } from "../share/constants";

import { FirebaseService } from "./firebase.service";
import { Session } from '../models/session';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private firebaseService: FirebaseService) { }

  move(dirToMove: number){
    switch(dirToMove){
      case(0): //up
        var curY = this.firebaseService.getPlayerYPos();
        this.firebaseService.setPlayerYPos(curY + 1);
        break;
      case(1): //right
        var curX = this.firebaseService.getPlayerXPos();
        this.firebaseService.setPlayerXPos(curX + 1);
        break;
      case(2): //down
        var curY = this.firebaseService.getPlayerYPos();
        this.firebaseService.setPlayerYPos(curY - 1);
        break;
      case(3): //left
        var curX = this.firebaseService.getPlayerXPos();
        this.firebaseService.setPlayerXPos(curX - 1);
        break;
      default:
        console.log("Bad Move Input - Not valid case");
    }
    // doesn't update quick enough??
    // console.log(this.firebaseService.getPlayerXPos() + "," +
    //   this.firebaseService.getPlayerYPos());

  }

  addPlayer(playerRole?: string, playerIds?: string[]) : string{
    var playerId = this.firebaseService.addPlayer();

    this.firebaseService.addEvent("Adding Player: " + " (" + playerId + ")");

    this.firebaseService.sessionRef().get().toPromise().then( (function(doc) {
      // console.log(obj.docs.forEach);
      // var playerIdArrMutable = [];
      var session = doc.data() as Session;

      var updatedNumPlayers = session.numPlayers + 1;

      this.firebaseService.sessionRef().update({
        numPlayers: updatedNumPlayers
      });

      if (updatedNumPlayers >= 6) {
        this.firebaseService.sessionRef().update({
          status: "FULL"
        });
      }
    }).bind(this))

    console.log("Added Player: " + " (" + playerId + ")");

    return this.firebaseService.getPlayerId();
  }

  createSession(sessionName: string, hostName: string) : string {
    this.firebaseService.addSession(sessionName, hostName);

    console.log("Session Id: " + this.firebaseService.getSessionId());

    return this.firebaseService.getSessionId();
  }

  assignCards(playerIds: string[]) {
    var rooms = Rooms;
    var suspects = Suspects;
    var weapons = Weapons;

    var roomIndex = _.random(0, rooms.length - 1);
    var suspectIndex = _.random(0, suspects.length - 1);
    var weaponIndex = _.random(0, weapons.length - 1);

    var confidential = {
      room: rooms[roomIndex].name,
      suspect: suspects[suspectIndex].name,
      weapon: weapons[weaponIndex].name
    };

    rooms = _.without(rooms, rooms[roomIndex]);
    suspects = _.without(suspects, suspects[suspectIndex]);
    weapons =  _.without(weapons, weapons[weaponIndex]);

    var cards = _.shuffle(rooms.concat(suspects, weapons));
    console.log("Cards: " + _.map(cards, "name"));

    var numberOfPlayers = playerIds.length;

    if (numberOfPlayers < 2) {
      console.error("Minimum number of players not met");
    }

    var cardsPerPlayer = Math.floor(cards.length / numberOfPlayers);
    var availableCards = cards.slice(0, cards.length % numberOfPlayers);

    this.firebaseService.addEvent("Available Cards for All Users: " + _.map(availableCards, "name"));

    this.firebaseService.sessionRef().update({
      confidential: confidential,
      currentTurn: this.firebaseService.getPlayerId()
    });

    // Assign cards to each player
    for (var _i = 0; _i < playerIds.length; _i++) {
      var startIndex = availableCards.length + _i * cardsPerPlayer;
      var endIndex = startIndex + cardsPerPlayer;

      var assignedCards = cards.slice(startIndex, endIndex);
      var assignedRooms = _.map(assignedCards.filter(card => card.type === "room"), "name");
      var assignedSuspects = _.map(assignedCards.filter(card => card.type === "suspect"), "name");
      var assignedWeapons = _.map(assignedCards.filter(card => card.type === "weapon"), "name");

      console.log(playerIds[_i] + " - Assigned Rooms: " + assignedRooms);
      console.log(playerIds[_i] + " - Assigned Suspects: " + assignedSuspects);
      console.log(playerIds[_i] + " - Assigned Weapons: " + assignedWeapons);

      this.firebaseService.playerRef(playerIds[_i]).update({
        cards: {
          rooms: assignedRooms,
          suspects: assignedSuspects,
          weapons: assignedWeapons
        }
      });
    }
  }
}
