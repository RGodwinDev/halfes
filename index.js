const config = require('./server/config'); // individual server configurations and other stuff goes here.

const express = require('express'); //framework for the server/app
const cors = require('cors'); //https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS, basically, handles incoming requests?
const {json} = require('body-parser'); //parse incoming requests with this
//port, probably need to change it if im going to have it hosted elsewhere
const port = config.port; //80 is default for most servers
const massive = require('massive'); //used for db management
const session = require('express-session'); // used for creating a session, which is mostly for the cookies?
//cookies save serverside, while client saves the cookie/session id

// const passport = require('passport');
// const { Strategy } = require('passport-twitch');
const masterRoutes = require('./server/masterRoutes'); //a file which manages all the routes, except the default one.
const twitchdbmanage = require('./server/features/twitch/twitchdbmanagement'); //the file that has the functions for managing the twitch db

// |||||||
// start app
// |||||||
const app = express();
//use cors and body-parser
app.use(cors()); //handling incoming requests
app.use(json()); //parsing incoming request

//creates a session, with info from server/config.js
app.use(session(config.session));

// i'm not sure if this is actually a good idea if site gets popular
// it serves all of the frontend files every time someone connects to the server???
// there's like 5mb+ in there, that adds up real quick.
// best to convert to ngnix in future
app.use('/', express.static(__dirname + '/public'));


// |||||||
// database management
// |||||||
massive(config.postgres).then(dbInstance => {
  app.set('db', dbInstance);
  //creates tables if brand new database
  dbInstance.createTables();

  //this has most of the stuff happening inside of it!
  //index.js is 10x shorter because its in here now
  //in the future, this should be on another server, just for twitch stuff.
  twitchdbmanage(app);
}); //end of massive function


// |||||||
// manages all the routes that aren't the default.
// |||||||
masterRoutes(app);







//passport just piggybacks off the express session and modifies it to be usable for authorizing users
//initialize passport
// app.use(passport.initialize());
// //makes the user object into a true deserialzed user object
// app.use(passport.session());

// //give the passport a strategy
// passport.use(new Strategy(config.Strategy, function(accessToken, refreshToken, profile, cb){
//   //not sure what these do, should research them.
//   console.log(profile);
//   profile.id = 1;
//   app.set('user', profile);
//   return cb(null, profile);
//
// }));
//

//worry about this stuff later, if theres time
// //if the person goes to this route, authenticate
// app.get('/auth/twitch', passport.authenticate('twitch', {forceVerify: true}));
// app.get('/auth/twitch/callback', passport.authenticate('twitch', {
//   //if authenticated, go home
//   successRedirect: '/',
//   //if authentication failed for one reason or another.
//   failureRedirect: '/auth/twitch'
// }));


// passport.serializeUser(function(user, cb){
//   cb(null, user);
// });
// passport.deserializeUser(function(obj, cb){
//   cb(null, obj);
// });

// |||||||
//listening..... on the port
// |||||||
app.listen(port, function(){
  console.log('listening on port ' + port)
});
