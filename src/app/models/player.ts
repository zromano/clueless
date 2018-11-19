export interface Player {
  cards: {
    rooms: string[];
    suspects: string[];
    weapons: string[];
  };
  role: string;
  suggestions: {
    rooms: {
      "Study": boolean;
      "Hall": boolean;
      "Lounge": boolean;
      "Library": boolean;
      "Billiard Room": boolean;
      "Dining Room": boolean;
      "Conservatory": boolean;
      "Ballroom": boolean;
      "Kitchen": boolean;
    };
    suspects: {
      "Colonel Mustard": boolean;
      "Miss Scarlet": boolean;
      "Professor Plum": boolean;
      "Mr. Green": boolean;
      "Mrs. White": boolean;
      "Mrs. Peacock": boolean;
    };
    weapons: {
      "Rope": boolean;
      "Lead Pipe": boolean;
      "Knife": boolean;
      "Wrench": boolean;
      "Candlestick": boolean;
      "Revolver": boolean;
    };
  };
}
