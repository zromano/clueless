export interface Player {
  cards: {
    rooms: string[];
    suspects: string[];
    weapons: string[];
  };
  role: string;
  position: string;
  xPos: number;
  yPos: number;
}
