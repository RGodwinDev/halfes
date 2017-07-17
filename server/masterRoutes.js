//require the routes here
//const exampleRoute = require(./features/example/exampleRoutes.js)
const twitchRoute = require('./features/twitch/twitchRoute.js');
const puppyRoute = require('./features/puppy/puppyRoute.js');
module.exports = function(app){
//export the routes here
//exampleRoute(app);
twitchRoute(app);
puppyRoute(app);
}
