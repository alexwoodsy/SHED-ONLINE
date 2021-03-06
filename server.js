const Server = require("boardgame.io/server").Server;
import { DEFAULT_PORT } from "./src/config";
import path from 'path';
import serve from 'koa-static';
const SHED = require("./src/game/Game").SHED;

const server = Server({ 
  games: [SHED]
 });

 const PORT = process.env.PORT || DEFAULT_PORT;

const lobbyConfig = {
  apiCallback: () => console.log('Running Lobby API on port ...'),
};

 // Build path relative to the server.js file
 const frontEndAppBuildPath = path.resolve(__dirname, './build');
 server.app.use(serve(frontEndAppBuildPath))
 
 server.run(PORT, () => {
   server.app.use(
     async (ctx, next) => await serve(frontEndAppBuildPath)(
       Object.assign(ctx, { path: 'index.html' }),
       next
     )
   )
 },
  //lobbyConfig
);

