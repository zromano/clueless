export interface Player {
  cards: {
    rooms: string[];
    suspects: string[];
    weapons: string[];
  };
  role: string;
  noTurn: boolean;
}
