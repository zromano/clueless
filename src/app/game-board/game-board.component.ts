import { Component, OnInit } from '@angular/core';

import "snapsvg-cjs";
declare var Snap: any;

import * as _ from "lodash";
import { Rooms, Suspects } from "../share/constants";

@Component({
  selector: 'game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {

  rooms: string[];
  suspects: string[];
  selectedRoom: string;
  selectedSuspect: string;

  constructor() {
    //TODO Clean up to utilize constants.ts
    this.rooms = ["Study", "Hall", "Lounge", "Library", "Billiard_Room", "Dining_Room", "Conservatory", "Ballroom", "Kitchen"];
    this.selectedRoom = this.rooms[0];

    this.suspects = ["Colonel_Mustard", "Miss_Scarlet", "Mr_Green", "Mrs_Peacock", "Mrs_White", "Professor_Plum"];
    this.selectedSuspect = this.suspects[0];
  }

  ngOnInit() {
    this.initBoard()
  }

  initBoard() {
    var board = Snap("#board");

    Snap.load("assets/board.svg", function(data) {
      var rooms = data.selectAll("#Rooms *");
      var hallways = data.selectAll("#Hallways *");
      var passages = data.selectAll("#Passages *");

      function move(dx, dy, posX, posY) {
        this.transform("t" + (posX + 300) + "," + (posY - 500));
      }

      function startDrag() {}

      function stopDrag() {}

      var suspects = ["Colonel_Mustard", "Miss_Scarlet", "Mr_Green", "Mrs_Peacock", "Mrs_White", "Professor_Plum"];

      for (let suspect of suspects) {
        let player = data.select("#" + suspect);
        player.drag(move, startDrag, stopDrag);
      }

      rooms.forEach(function(room) {
        room.mouseover(function() {
          this.animate({ fill: "#bada55" }, 200);
        }).mouseout(function() {
          this.animate({ fill: "#ffffff" }, 200);
        });
      });

      hallways.forEach(function(hallway) {
        hallway.mouseover(function() {
          this.animate({ fill: "#bada55" }, 200);
        }).mouseout(function() {
          this.animate({ fill: "#707070" }, 200);
        });
      });

      // passages.forEach(function(passage) {
      //   passage.mouseover(function() {
      //     this.animate({ fill: "#ff0000" }, 600);
      //   }).mouseout(function() {
      //     this.animate({ fill: "#bada55" }, 200);
      //   });
      // });

      board.append(data);
    });
  }

  movePlayer() {
    var board = Snap("#board");

    var roomIndex = this.rooms.indexOf(this.selectedRoom);
    var position = board.select("#_" + roomIndex + "8");

    var positionX = position.getBBox().cx - 150;
    var positionY = position.getBBox().cy - 250;

    var suspect = board.select("#" + this.selectedSuspect);

    console.log(position.getBBox());
    console.log(suspect.getBBox());

    suspect.transform("t" + positionX + "," + positionY);

    console.log(suspect.getBBox());
    console.log(positionX + "," + positionY);
  }
}
