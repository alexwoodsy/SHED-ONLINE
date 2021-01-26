import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer'
import { SHED } from './Game';
import { SHEDtable } from './Table';



const SHEDClient = Client({
  game: SHED,
  board: SHEDtable,
  numPlayers: 4,
  multiplayer: Local()
});

const App = () => (
  <div>
    <SHEDClient playerID="0"/>
    <SHEDClient playerID="1"/>
    <SHEDClient playerID="2"/>
    <SHEDClient playerID="3"/>
  </div>
);

export default App;
