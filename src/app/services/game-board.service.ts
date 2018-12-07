import { Injectable } from '@angular/core';

import "snapsvg-cjs";
declare var Snap: any;

import * as _ from "lodash";
import { Rooms, Suspects, Weapons } from "../share/constants";

@Injectable({
  providedIn: 'root'
})
export class GameBoardService {

  constructor() { }

  initBoard() {
    var board = Snap("#board");

    Snap.load("assets/board.svg", function(data) {
      var rooms = data.selectAll("#Outlines *");
      var hallways = data.selectAll("#Hallways *");
      var suspects = data.selectAll("#Suspects *");
      var weapons = data.selectAll("#Weapons *");

      rooms.forEach(function(room) {
        room.mouseover(function() {
          this.animate({ fill: "#CFD8DC" }, 200);
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

      suspects.forEach(function(suspect) {
        var suspectId = suspect.attr("id");
        var suspectIndex = _.map(Suspects, "id").indexOf(suspectId);
        var position = Suspects[suspectIndex].board.split(",").map(Number);

        // Save the original transform values (tx, ty) and new value when element is moved to 0,0 (tx0, ty0)
        var transform = suspect.attr("transform").localMatrix;
        suspect.attr({
          tx: transform.e, ty: transform.f,
          tx0: transform.e - (position[0] * 50),
          ty0: transform.f - (position[1] * 50)
        });
      });

      weapons.forEach(function(weapon) {
        var weapondId = weapon.attr("id");
        var weaponIndex = _.map(Weapons, "id").indexOf(weapondId);
        var position = Weapons[weaponIndex].position.split(",").map(Number);

        // Save the original transform values (tx, ty) and new value when element is moved to 0,0 (tx0, ty0)
        var transform = weapon.attr("transform").localMatrix;
        weapon.attr({
          tx: transform.e, ty: transform.f,
          tx0: transform.e - (position[0] * 50),
          ty0: transform.f - (position[1] * 50)
        });
      });

      board.append(data);
    });
  }

  movePlayer(name: string, x: number, y: number) {
    var board = Snap("#board");
    var suspectIndex = _.map(Suspects, "name").indexOf(name);

    console.log("Move Player Inputs: " + name + "," + x + "," + y);
    console.log("Move Player Suspect Index: " + suspectIndex);

    var suspect = board.select("#" + Suspects[suspectIndex].id);
    var positionX = Number(suspect.attr("tx0")) + (x * 50);
    var positionY = Number(suspect.attr("ty0")) + (y * 50);

    console.log("Move Player X: " + suspect.attr("tx0") + "," + (x * 50));
    console.log("Move Player Y: " + suspect.attr("ty0") + "," + (y * 50));
    console.log("Move Player: " + positionX + "," + positionY);

    suspect.transform("t" + positionX + "," + positionY);
  }

  moveWeapon(name: string, x: number, y: number) {
    var board = Snap("#board");
    var weaponIndex = _.map(Weapons, "name").indexOf(name);

    var weapon = board.select("#" + Weapons[weaponIndex].id);
    var positionX = Number(weapon.attr("tx0")) + (x * 50);
    var positionY = Number(weapon.attr("ty0")) + (y * 50);

    console.log(weapon.attr("transform"));

    weapon.transform("t" + positionX + "," + positionY);

    console.log(weapon.attr("transform"));
  }
}
