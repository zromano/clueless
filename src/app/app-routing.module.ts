import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GameBoardComponent } from './game-board/game-board.component';
import { GameComponent } from "./game/game.component";

const routes: Routes = [
  // { path: '', redirectTo: '/session', pathMatch: 'full' },
  { path: 'board', component: GameBoardComponent }//,
  // { path: 'session', component: GameComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
