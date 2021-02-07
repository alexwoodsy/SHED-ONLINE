const Server = require("boardgame.io/server").Server;
import path from 'path';
import serve from 'koa-static';
const SHED = require("./game/Game").SHED;

const server = Server({ 
  games: [SHED],
 });

const PORT = process.env.PORT || 8000;

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, './build');
server.app.use(serve(frontEndAppBuildPath))

const lobbyConfig = {
    apiPort: PORT,
    apiCallback: () => console.log('Running Lobby API on port 8080...'),
  };

  server.run({
    port: PORT,
    caback: () => {
      server.app.use(
        async (ctx, next) => await serve(frontEndAppBuildPath)(Object.assign(ctx, { path: "index.html" }), next)
      );
    },
    lobbyConfig: lobbyConfig,
  });
