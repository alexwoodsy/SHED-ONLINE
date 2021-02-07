const Server = require("boardgame.io/server").Server;
const SHED = require("./game/Game").SHED;

const server = Server({ 
  games: [SHED],
 });

const PORT = process.env.PORT || 8000;

const lobbyConfig = {
    apiCallback: () => console.log('Running Lobby API on port 8080...'),
  };

server.run({
    port:PORT,
    apiCallback: () => console.log('Running Server API on port 8080...'),
    lobbyConfig,
});
