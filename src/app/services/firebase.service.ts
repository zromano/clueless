import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/firestore";
import { Injectable } from "@angular/core";

import * as firebase from "firebase/app";
import "firebase/firestore";

import { Event } from "../models/event";
import { Player } from "../models/player";
import { Session } from "../models/session";

@Injectable({
  providedIn: "root"
})
export class FirebaseService {

  private playerId: string;
  private playerRole: string;
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

  getPlayerRole(): string {
    return this.playerRole;
  }

  setPlayerRole(role: string) {
    this.playerRole = role;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  setSessionId(id: string) {
    this.sessionId = id;
  }

  eventRef(): AngularFirestoreCollection<Event> {
    return this.db.collection<Event>("sessions/" + this.sessionId + "/events");
  }

  playerRef(id?: string): AngularFirestoreDocument<Player> {
    var playerId = id ? id : this.playerId;
    return this.db.doc<Player>("sessions/" + this.sessionId + "/players/" + playerId);
  }

  sessionRef(): AngularFirestoreDocument<Session> {
    return this.db.doc<Session>("sessions/" + this.sessionId);
  }

  addEvent(message: string) {
    const event: Event = {
      authorId: this.getPlayerId(),
      message: message,
      role: this.getPlayerRole(),
      timestamp: firebase.firestore.Timestamp.now()
    };

    this.eventRef().add(event);
  }

  addPlayer(playerRole: string): string {
    var playerId = this.generateId();

    const player: Player = {
      cards: {
        rooms: [],
        suspects: [],
        weapons: []
      },
      role: playerRole,
      xPos: 0
      yPos: 0
      suggestions: {
        rooms: {
          "Study": null,
          "Hall": null,
          "Lounge": null,
          "Library": null,
          "Billiard Room": null,
          "Dining Room": null,
          "Conservatory": null,
          "Ballroom": null,
          "Kitchen": null,
        },
        suspects: {
          "Colonel Mustard": null,
          "Miss Scarlet": null,
          "Professor Plum": null,
          "Mr. Green": null,
          "Mrs. White": null,
          "Mrs. Peacock": null,
        },
        weapons: {
          "Rope": null,
          "Lead Pipe": null,
          "Knife": null,
          "Wrench": null,
          "Candlestick": null,
          "Revolver": null,
        }
      }
    }

    this.playerRef(playerId).set(player);

    return playerId;
  }

  addSession() {
    const sessionId = this.generateId();
    this.setSessionId(sessionId);

    const session: Session = {
      confidential: {
        room: "",
        suspect: "",
        weapon: ""
      },
      currentTurn: "",
      turnOrder: [],
      suspects: {
        "Colonel Mustard": "",
        "Miss Scarlet": "",
        "Professor Plum": "",
        "Mr. Green": "",
        "Mrs. White": "",
        "Mrs. Peacock": "",
      },
      weapons: {
        "Rope": "",
        "Lead Pipe": "",
        "Knife": "",
        "Wrench": "",
        "Candlestick": "",
        "Revolver": "",
      }
    };

    this.sessionRef().set(session);
  }
}
