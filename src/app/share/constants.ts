export const Rooms = [
  { type: "room", name: "Ballroom", position: "2,0" },
  { type: "room", name: "Billiard Room", position: "2,2" },
  { type: "room", name: "Conservatory", position: "0,0" },
  { type: "room", name: "Dining Room", position: "4,2" },
  { type: "room", name: "Hall", position: "2,4" },
  { type: "room", name: "Kitchen", position: "4,0" },
  { type: "room", name: "Library", position: "0,2" },
  { type: "room", name: "Lounge", position: "4,4" },
  { type: "room", name: "Study", position: "0,4"}
];

export const Suspects = [
  { type: "suspect", name: "Colonel Mustard", position: "Hallway: Study-Hall" },
  { type: "suspect", name: "Miss Scarlet", position: "Hallway: Kitchen-Ballroom" },
  { type: "suspect", name: "Mr. Green", position: "Hallway: Study-Library" },
  { type: "suspect", name: "Mrs. Peacock", position: "Hallway: Kitchen-Dining Room" },
  { type: "suspect", name: "Mrs. White", position: "Hallway: Conservatory-Ballroom" },
  { type: "suspect", name: "Professor Plum", position: "Hallway: Lounge-Hall" }
];

export const Weapons = [
  { type: "weapon", name: "Candlestick", position: "0,0" },
  { type: "weapon", name: "Knife", position: "0,2" },
  { type: "weapon", name: "Lead Pipe", position: "0,4" },
  { type: "weapon", name: "Revolver", position: "4,0" },
  { type: "weapon", name: "Rope", position: "4,2" },
  { type: "weapon", name: "Wrench", position: "4,4" }
];

export const Positions = {
  "Study": {
    type: "room",
    validMoves: [
      "Hallway: Study-Hall",
      "Kitchen",
      "Hallway: Study-Library"
    ],
    uiCoords: [
      { x: 0,
        y: 0,
        isOccupied: false
      },
      { x: 0,
        y: 1,
        isOccupied: false
      },
      { x: 0,
        y: 2,
        isOccupied: false
      },
      { x: 1,
        y: 0,
        isOccupied: false
      },
      { x: 1,
        y: 1,
        isOccupied: false
      },
      { x: 0,
        y: 2,
        isOccupied: false
      },
      { x: 2,
        y: 0,
        isOccupied: false
      },
      { x: 2,
        y: 1,
        isOccupied: false
      },
      { x: 2,
        y: 2,
        isOccupied: false
      }
    ]
  },
  "Hall": {
    type: "room",
    validMoves: [
      "Hallway: Study-Hall",
      "Hallway: Lounge-Hall",
      "Hallway: Hall-Billiard Room"
    ],
    uiCoords: [
      { x: 4,
        y: 0,
        isOccupied: false
      },
      { x: 4,
        y: 1,
        isOccupied: false
      },
      { x: 4,
        y: 2,
        isOccupied: false
      },
      { x: 5,
        y: 0,
        isOccupied: false
      },
      { x: 5,
        y: 1,
        isOccupied: false
      },
      { x: 5,
        y: 2,
        isOccupied: false
      },
      { x: 6,
        y: 0,
        isOccupied: false
      },
      { x: 6,
        y: 1,
        isOccupied: false
      },
      { x: 6,
        y: 2,
        isOccupied: false
      }
    ]
  },
  "Lounge": {
    type: "room",
    validMoves: [
      "Hallway: Lounge-Dining Room",
      "Hallway: Lounge-Hall",
      "Conservatory"
    ],
    uiCoords: [
      { x: 8,
        y: 0,
        isOccupied: false
      },
      { x: 8,
        y: 1,
        isOccupied: false
      },
      { x: 8,
        y: 2,
        isOccupied: false
      },
      { x: 9,
        y: 0,
        isOccupied: false
      },
      { x: 9,
        y: 1,
        isOccupied: false
      },
      { x: 9,
        y: 2,
        isOccupied: false
      },
      { x: 10,
        y: 0,
        isOccupied: false
      },
      { x: 10,
        y: 1,
        isOccupied: false
      },
      { x: 10,
        y: 2,
        isOccupied: false
      }
    ]
  },
  "Library": {
    type: "room",
    validMoves: [
      "Hallway: Study-Library",
      "Hallway: Library-Billiard Room",
      "Hallway: Conservatory-Library"
    ],
    uiCoords: [
      { x: 0,
        y: 4,
        isOccupied: false
      },
      { x: 0,
        y: 5,
        isOccupied: false
      },
      { x: 0,
        y: 6,
        isOccupied: false
      },
      { x: 1,
        y: 4,
        isOccupied: false
      },
      { x: 1,
        y: 5,
        isOccupied: false
      },
      { x: 1,
        y: 6,
        isOccupied: false
      },
      { x: 2,
        y: 4,
        isOccupied: false
      },
      { x: 2,
        y: 5,
        isOccupied: false
      },
      { x: 2,
        y: 6,
        isOccupied: false
      }
    ]
  },
  "Billiard Room": {
    type: "room",
    validMoves: [
      "Hallway: Hall-Billiard Room",
      "Hallway: Library-Billiard Room",
      "Hallway: Dining Room-Billiard Room",
      "Hallway: Ballroom-Billiard Room",
    ],
    uiCoords: [
      { x: 4,
        y: 4,
        isOccupied: false
      },
      { x: 4,
        y: 5,
        isOccupied: false
      },
      { x: 4,
        y: 6,
        isOccupied: false
      },
      { x: 5,
        y: 4,
        isOccupied: false
      },
      { x: 5,
        y: 5,
        isOccupied: false
      },
      { x: 5,
        y: 6,
        isOccupied: false
      },
      { x: 6,
        y: 4,
        isOccupied: false
      },
      { x: 6,
        y: 5,
        isOccupied: false
      },
      { x: 6,
        y: 6,
        isOccupied: false
      }
    ]
  },
  "Dining Room": {
    type: "room",
    validMoves: [
      "Hallway: Lounge-Dining Room",
      "Hallway: Kitchen-Dining Room",
      "Hallway: Dining Room-Billiard Room"
    ],
    uiCoords: [
      { x: 8,
        y: 4,
        isOccupied: false
      },
      { x: 8,
        y: 5,
        isOccupied: false
      },
      { x: 8,
        y: 6,
        isOccupied: false
      },
      { x: 9,
        y: 4,
        isOccupied: false
      },
      { x: 9,
        y: 5,
        isOccupied: false
      },
      { x: 9,
        y: 6,
        isOccupied: false
      },
      { x: 10,
        y: 4,
        isOccupied: false
      },
      { x: 10,
        y: 5,
        isOccupied: false
      },
      { x: 10,
        y: 6,
        isOccupied: false
      }
    ]
  },
  "Conservatory": {
    type: "room",
    validMoves: [
      "Hallway: Conservatory-Library",
      "Hallway: Conservatory-Ballroom",
      "Lounge"
    ],
    uiCoords: [
      { x: 0,
        y: 8,
        isOccupied: false
      },
      { x: 0,
        y: 9,
        isOccupied: false
      },
      { x: 0,
        y: 10,
        isOccupied: false
      },
      { x: 1,
        y: 8,
        isOccupied: false
      },
      { x: 1,
        y: 9,
        isOccupied: false
      },
      { x: 1,
        y: 10,
        isOccupied: false
      },
      { x: 2,
        y: 8,
        isOccupied: false
      },
      { x: 2,
        y: 9,
        isOccupied: false
      },
      { x: 2,
        y: 10,
        isOccupied: false
      }
    ]
  },
  "Ballroom": {
    type: "room",
    validMoves: [
      "Hallway: Kitchen-Ballroom",
      "Hallway: Conservatory-Ballroom",
      "Hallway: Ballroom-Billiard Room",
    ],
    uiCoords: [
      { x: 4,
        y: 8,
        isOccupied: false
      },
      { x: 4,
        y: 9,
        isOccupied: false
      },
      { x: 4,
        y: 10,
        isOccupied: false
      },
      { x: 5,
        y: 8,
        isOccupied: false
      },
      { x: 5,
        y: 9,
        isOccupied: false
      },
      { x: 5,
        y: 10,
        isOccupied: false
      },
      { x: 6,
        y: 8,
        isOccupied: false
      },
      { x: 6,
        y: 9,
        isOccupied: false
      },
      { x: 6,
        y: 10,
        isOccupied: false
      }
    ]
  },
  "Kitchen": {
    type: "room",
    validMoves: [
      "Hallway: Kitchen-Dining Room",
      "Hallway: Kitchen-Ballroom",
      "Study"
    ],
    uiCoords: [
      { x: 0,
        y: 8,
        isOccupied: false
      },
      { x: 0,
        y: 9,
        isOccupied: false
      },
      { x: 0,
        y: 10,
        isOccupied: false
      },
      { x: 1,
        y: 8,
        isOccupied: false
      },
      { x: 1,
        y: 9,
        isOccupied: false
      },
      { x: 1,
        y: 10,
        isOccupied: false
      },
      { x: 2,
        y: 8,
        isOccupied: false
      },
      { x: 2,
        y: 9,
        isOccupied: false
      },
      { x: 2,
        y: 10,
        isOccupied: false
      }
    ]
  },
  "Hallway: Study-Hall": {
    type: "hallway",
    validMoves: [
      "Study",
      "Hall"
    ],
    uiCoords: [
      { x: 3,
        y: 1,
        isOccupied: false
      }
    ]
  },
  "Hallway: Lounge-Hall": {
    type: "hallway",
    validMoves: [
      "Lounge",
      "Hall"
    ],
    uiCoords: [
      { x: 7,
        y: 1,
        isOccupied: false
      }
    ]
  },
  "Hallway: Study-Library": {
    type: "hallway",
    validMoves: [
      "Study",
      "Library"
    ],
    uiCoords: [
      { x: 1,
        y: 3,
        isOccupied: false
      }
    ]
  },
  "Hallway: Hall-Billiard Room": {
    type: "hallway",
    validMoves: [
      "Hall",
      "Billiard Room"
    ],
    uiCoords: [
      { x: 5,
        y: 3,
        isOccupied: false
      }
    ]
  },
  "Hallway: Lounge-Dining Room": {
    type: "hallway",
    validMoves: [
      "Lounge",
      "Dining Room"
    ],
    uiCoords: [
      { x: 9,
        y: 3,
        isOccupied: false
      }
    ]
  },
  "Hallway: Library-Billiard Room": {
    type: "hallway",
    validMoves: [
      "Library",
      "Billiard Room"
    ],
    uiCoords: [
      { x: 3,
        y: 5,
        isOccupied: false
      }
    ]
  },
  "Hallway: Dining Room-Billiard Room": {
    type: "hallway",
    validMoves: [
      "Dining Room",
      "Billiard Room"
    ],
    uiCoords: [
      { x: 7,
        y: 5,
        isOccupied: false
      }
    ]
  },
  "Hallway: Conservatory-Library": {
    type: "hallway",
    validMoves: [
      "Conservatory",
      "Library"
    ],
    uiCoords: [
      { x: 1,
        y: 7,
        isOccupied: false
      }
    ]
  },
  "Hallway: Ballroom-Billiard Room": {
    type: "hallway",
    validMoves: [
      "Ballroom",
      "Billiard Room"
    ],
    uiCoords: [
      { x: 5,
        y: 7,
        isOccupied: false
      }
    ]
  },
  "Hallway: Kitchen-Dining Room": {
    type: "hallway",
    validMoves: [
      "Kitchen",
      "Dining Room"
    ],
    uiCoords: [
      { x: 9,
        y: 7,
        isOccupied: false
      }
    ]
  },
  "Hallway: Conservatory-Ballroom": {
    type: "hallway",
    validMoves: [
      "Conservatory",
      "Ballroom"
    ],
    uiCoords: [
      { x: 3,
        y: 9,
        isOccupied: false
      }
    ]
  },
  "Hallway: Kitchen-Ballroom": {
    type: "hallway",
    validMoves: [
      "Kitchen",
      "Ballroom"
    ],
    uiCoords: [
      { x: 7,
        y: 9,
        isOccupied: false
      }
    ]
  },
};