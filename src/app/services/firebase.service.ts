import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/firestore";
import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';

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
  private sessionId: string;
  private curXPos: number = 0;
  private curYPos: number = 0;
  private curPos: string;

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

  getPlayerXPos(): number {
    var curPlayer = this.playerRef().valueChanges().subscribe(data=>{
         this.curXPos = data.xPos;
    });
    return this.curXPos;
  }

  setPlayerXPos(newX: number) {
    console.log("setX: " + newX)
    this.playerRef().update({ xPos: newX });
  }

  getPlayerYPos(): number {
    var curPlayer = this.playerRef().valueChanges().subscribe(data=>{
         this.curYPos = data.yPos;
    });
    return this.curYPos;
  }

  setPlayerYPos(newY: number) {
    console.log("setY: " + newY)
    this.playerRef().update({ yPos: newY });
  }

  getPlayerPos(): string {
    var curPlayer = this.playerRef().valueChanges().subscribe(data=>{
         this.curPos = data.position;
    });
    return this.curPos;
  }

  eventRef(): AngularFirestoreCollection<Event> {
    return this.db.collection<Event>("sessions/" + this.sessionId + "/events");
  }

  playerRef(id?: string): AngularFirestoreDocument<Player> {
    var playerId = id ? id : this.playerId;
    return this.db.doc<Player>("sessions/" + this.sessionId + "/players/" + playerId);
  }

  playersRef(): AngularFirestoreCollection<Player> {
    return this.db.collection<Player>("sessions/" + this.sessionId + "/players");
  }

  sessionRef(): AngularFirestoreDocument<Session> {
    return this.db.doc<Session>("sessions/" + this.sessionId);
  }

  gameRef(): AngularFirestoreCollection<Session> {
    return this.db.collection<Session>("sessions/");
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
      position: "",
      xPos: 0,
      yPos: 0,
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
      availableRoles: [
        "Colonel Mustard",
        "Miss Scarlet",
        "Professor Plum",
        "Mr. Green",
        "Mrs. White",
        "Mrs. Peacock"
      ],
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
      },
      gameBoard: {}
    };

    this.sessionRef().set(session);
  }
}
