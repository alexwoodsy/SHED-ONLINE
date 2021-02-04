import Server from "boardgame.io/server";
import SHED from "./game";


const server = Server({ 
  games: [SHED],
 });

const lobbyConfig = {
    apiPort: 8080,
    apiCallback: () => console.log('Running Lobby API on port 8080...'),
  };

server.run({
    port: 8000,
    lobbyConfig,
});
