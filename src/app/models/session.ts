import { Suggestion } from "./suggestion";

export interface Session {
  sessionName: string;
  hostName: string;
  hostId: string;
  status: string;
  numPlayers: number;
  confidential: {
    room: string;
    suspect: string;
    weapon: string;
  };
  currentTurn: string;
  turnOrder: string[];
  availableRoles: string[];
  suggestionInProgess: Suggestion;
  suspects: {
    "Colonel Mustard": {};
    "Miss Scarlet": {};
    "Professor Plum": {};
    "Mr. Green": {};
    "Mrs. White": {};
    "Mrs. Peacock": {};
  };
  weapons: {
    "Rope": string;
    "Lead Pipe": string;
    "Knife": string;
    "Wrench": string;
    "Candlestick": string;
    "Revolver": string;
  };
  gameBoard: {};
}
