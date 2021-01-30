import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer'
import { SHED } from './Game';
import { SHEDtable } from './Table';

export const SHEDClient = Client({
    game: SHED,
    board: SHEDtable,
    debug: true,
    multiplayer: SocketIO({server: "localhost:8000"}),
  });
