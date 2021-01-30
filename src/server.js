const { Server } = require('boardgame.io/server');
const { SHED } = require('./Game');

const server = Server({ games: [SHED] });


server.run({
    port: 8000,
});
