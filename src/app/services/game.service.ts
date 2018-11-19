import { Injectable } from '@angular/core';

import * as _ from "lodash";
import { Rooms, Suspects, Weapons } from "../share/constants";

import { FirebaseService } from "../services/firebase.service";

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private firebaseService: FirebaseService) { }

  addPlayer(playerRole: string, playerIds?: string[]) {
    var playerId = this.firebaseService.addPlayer(playerRole);

    if (playerIds) {
      playerIds.push(playerId);
      var turnOrder = _.shuffle(playerIds);

      // Update turnOrder list after each player addition
      this.firebaseService.sessionRef().update({
        turnOrder: turnOrder
      });
    }

    this.firebaseService.addEvent("Adding Player: " + playerRole + " (" + playerId + ")");

    console.log("Added Player: " + playerRole + " (" + playerId + ")");
  }

  createSession() {
    this.firebaseService.addSession();

    // TODO: Colonel Mustard is currently set as the default user when the session is created
    this.firebaseService.setPlayerRole("Colonel Mustard");
    var playerId = this.firebaseService.addPlayer(this.firebaseService.getPlayerRole());
    this.firebaseService.setPlayerId(playerId);

    this.firebaseService.sessionRef().update({
      currentTurn: playerId,
      turnOrder: [ playerId ]
    });

    console.log("Session Id: " + this.firebaseService.getSessionId());
    console.log("Player Id: " + this.firebaseService.getPlayerId());
    console.log("Player Role: " + this.firebaseService.getPlayerRole());
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
