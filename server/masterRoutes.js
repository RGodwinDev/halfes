//require the routes here
//const exampleRoute = require(./features/example/exampleRoutes.js)
const twitchRoute = require('./features/twitch/twitchRoute.js');
module.exports = function(app){
//export the routes here
//exampleRoute(app);
twitchRoute(app);
}
