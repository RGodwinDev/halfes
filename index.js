const config = require('./server/config');

const express = require('express');
const cors = require('cors');
const {json} = require('body-parser');
//port, probably need to change it if im going to have it hosted elsewhere
const port = config.port; //80 is default for most servers
const massive = require('massive');
const session = require('express-session');
// const passport = require('passport');
// const { Strategy } = require('passport-twitch');
const masterRoutes = require('./server/masterRoutes');
const twitchdbmanage = require('./server/features/twitch/twitchdbmanagement');


//start app
const app = express();
//twitchkeeper db management
//use cors and body-parser
app.use(cors());
app.use(json());

//creates a session, with info from server/config.js
app.use(session(config.session));

//when someone comes to the website, it gives them the frontend from /public
app.use('/', express.static(__dirname + '/public'));

massive(config.postgres).then(dbInstance => {
  app.set('db', dbInstance);
  //creates tables if brand new database
  dbInstance.createTables();

  //this has most of the stuff happening inside of it!
  //index.js is 10x shorter because its in here now
  //in the future, this should be on another server, just for twitch stuff.
  twitchdbmanage(app);
}); //end of massive function

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

//listening..... on the port
app.listen(port, function(){
  console.log('listening on port ' + port)
});
