import { Component, OnInit } from '@angular/core';

import { GameService } from "../../services/game.service";

import { Router } from '@angular/router';

@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.css']
})
export class CreateSessionComponent implements OnInit {
  sessionName: string;
  hostName: string;

  constructor(
    private gameService: GameService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  createSession() {
    var sessionId = this.gameService.createSession(this.sessionName, this.hostName);
    var playerId = this.gameService.addPlayer();
    this.router.navigate(['/session', sessionId, playerId]);
  }
}
