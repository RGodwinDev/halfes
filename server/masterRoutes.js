//require the routes here
//const exampleRoute = require(./features/example/exampleRoutes.js)
const twitchRoute = require('./features/twitch/twitchRoute');
const puppyRoute = require('./features/puppy/puppyRoute');
const meowRoute = require('./features/meow/meowRoute')
const blogRoute = require('./features/blog/blogRoute');
module.exports = function(app){
//export the routes here
//exampleRoute(app);
twitchRoute(app);
puppyRoute(app);
meowRoute(app);
blogRoute(app);
}
