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
  availableRoles: string[]
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
  gameBoard: {}; 
}
