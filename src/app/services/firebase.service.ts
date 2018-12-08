import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/firestore";
import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';

import * as firebase from "firebase/app";
import "firebase/firestore";

import * as _ from "lodash";

import { Event } from "../models/event";
import { Player } from "../models/player";
import { Session } from "../models/session";

import { Suspects, Weapons } from '../share/constants';

@Injectable({
  providedIn: "root"
})
export class FirebaseService {

  private playerId: string;
  private sessionId: string;

  constructor(private db: AngularFirestore) {}

  generateId(): string {
    return this.db.createId();
  }

  getPlayerId(): string {
    return this.playerId;
  }

  setPlayerId(id: string) {
    this.playerId = id;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  setSessionId(id: string) {
    this.sessionId = id;
  }

  eventRef(): AngularFirestoreCollection<Event> {
    return this.db.collection<Event>("sessions/" + this.sessionId + "/events", ref => ref.orderBy('timestamp', 'desc'));
  }

  playerRef(id?: string): AngularFirestoreDocument<Player> {
    var playerId = id ? id : this.playerId;
    return this.db.doc<Player>("sessions/" + this.sessionId + "/players/" + playerId);
  }

  playerEventRef(id?: string): AngularFirestoreCollection<Event> {
    var playerId = id ? id : this.playerId;
    return this.db.collection<Event>("sessions/" + this.sessionId + "/players/" + playerId + "/events", ref => ref.orderBy('timestamp', 'desc'));
  }

  playersRef(): AngularFirestoreCollection<Player> {
    return this.db.collection<Player>("sessions/" + this.sessionId + "/players");
  }

  sessionRef(): AngularFirestoreDocument<Session> {
    return this.db.doc<Session>("sessions/" + this.sessionId);
  }

  gameRef(): AngularFirestoreCollection<Session> {
    return this.db.collection<Session>("sessions/", ref => ref.orderBy('sessionName'));
  }

  addEvent(message: string) {
    const event: Event = {
      authorId: this.getPlayerId(),
      message: message,
      role: "",
      timestamp: firebase.firestore.Timestamp.now()
    };

    this.eventRef().add(event);
  }

  addPlayerEvent(message: string) {
    const event: Event = {
      authorId: this.getPlayerId(),
      message: message,
      role: "",
      timestamp: firebase.firestore.Timestamp.now()
    };

    this.playerEventRef().add(event);
  }

  addPlayer(): string {
    var playerId = this.generateId();
    this.setPlayerId(playerId);

    const player: Player = {
      cards: {
        rooms: [],
        suspects: [],
        weapons: []
      },
      role: "",
      noTurn: false
    }

    this.playerRef(playerId).set(player);

    return playerId;
  }

  addSession(sessionName: string, hostName: string) {
    const sessionId = this.generateId();
    this.setSessionId(sessionId);

    const session: Session = {
      sessionName: sessionName,
      hostName: hostName,
      hostId: "",
      status: "WAITING",
      numPlayers: 0,
      confidential: {
        room: "",
        suspect: "",
        weapon: ""
      },
      currentTurn: "",
      turnOrder: [],
      suggestionInProgess: null,
      availableRoles: [
        "Colonel Mustard",
        "Miss Scarlet",
        "Professor Plum",
        "Mr. Green",
        "Mrs. White",
        "Mrs. Peacock"
      ],
      suspects: {
        "Colonel Mustard": {
          position: "",
          coordinate: _.filter(Suspects, ['name', "Colonel Mustard"])[0].board
        },
        "Miss Scarlet": {
          position: "",
          coordinate: _.filter(Suspects, ['name', "Miss Scarlet"])[0].board
        },
        "Professor Plum": {
          position: "",
          coordinate: _.filter(Suspects, ['name', "Professor Plum"])[0].board
        },
        "Mr. Green": {
          position: "",
          coordinate: _.filter(Suspects, ['name', "Mr. Green"])[0].board
        },
        "Mrs. White": {
          position: "",
          coordinate: _.filter(Suspects, ['name', "Mrs. White"])[0].board
        }
          ,
        "Mrs. Peacock": {
          position: "",
          coordinate: _.filter(Suspects, ['name', "Mrs. Peacock"])[0].board
        },
      },
      weapons: {
        "Rope": _.filter(Weapons, ['name', "Rope"])[0].position,
        "Lead Pipe": _.filter(Weapons, ['name', "Lead Pipe"])[0].position,
        "Knife": _.filter(Weapons, ['name', "Knife"])[0].position,
        "Wrench": _.filter(Weapons, ['name', "Wrench"])[0].position,
        "Candlestick": _.filter(Weapons, ['name', "Candlestick"])[0].position,
        "Revolver": _.filter(Weapons, ['name', "Revolver"])[0].position,
      },
      gameBoard: {}
    };

    this.sessionRef().set(session);
  }
}
