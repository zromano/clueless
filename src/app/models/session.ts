export interface Session {
  sessionName: string;
  hostName: string;
  status: string;
  confidential: {
    room: string;
    suspect: string;
    weapon: string;
  };
  currentTurn: string;
  turnOrder: string[];
  suspects: {
    "Colonel Mustard": string;
    "Miss Scarlet": string;
    "Professor Plum": string;
    "Mr. Green": string;
    "Mrs. White": string;
    "Mrs. Peacock": string;
  };
  weapons: {
    "Rope": string;
    "Lead Pipe": string;
    "Knife": string;
    "Wrench": string;
    "Candlestick": string;
    "Revolver": string;
  };
}
