const express = require('express');
const cors = require('cors');
const {json} = require('body-parser');
//port, probably need to change it if im going to have it hosted elsewhere
const port = 3000;
const massive = require('massive');
const session = require('express-session');
const config = require('./server/config');
const passport = require('passport');
const { Strategy } = require('passport-twitch');
const axios = require('axios');

//start app
const app = express();
//use cors and body-parser
app.use(cors());
app.use(json());

//creates a session, with info from server/config.js
app.use(session(config.session));

//when someone comes to the website, it gives them the frontend from /public
app.use('/', express.static(__dirname + '/public'));

massive(config.postgres).then(dbInstance => {
  app.set('db', dbInstance);
  //do stuff with db here?
});

//passport just piggybacks off the express session and modifies it to be usable for authorizing users
//initialize passport
app.use(passport.initialize());
//makes the user object into a true deserialzed user object
app.use(passport.session());

//give the passport a strategy
passport.use(new Strategy(config.Strategy, function(accessToken, refreshToken, profile, cb){
  //not sure what these do, should research them.
  console.log(profile);
  profile.id = 1;
  app.set('user', profile);
  return cb(null, profile);

}));


//worry about this stuff later, if theres time
//if the person goes to this route, authenticate
app.get('/auth/twitch', passport.authenticate('twitch', {forceVerify: true}));
app.get('/auth/twitch/callback', passport.authenticate('twitch', {
  //if authenticated, go home
  successRedirect: '/',
  //if authentication failed for one reason or another.
  failureRedirect: '/auth/twitch'
}));

//cant do this as backend isnt in angular, just js?
//answer: use axios, its pretty much the same as $http
app.get('/api/getStreamers', function(req, res){
  //make it so this request happens every 5 minutes, and we get this data from the database
  axios({
    method: 'GET',
    url: 'https://api.twitch.tv/kraken/streams/',
    headers: {'Client-ID':'7xganf8cmv116235dcf9vcun4lcqvb'},
  }).then(function(response){
    res.send(response.data);
  })
});
app.get('/api/getChannel/:id', function(req, res){
  console.log('inside getChannel, serverside')
  axios({
    method: 'GET',
    //need to make it so that it gets channel, based on the id
    url: 'https://api.twitch.tv/kraken/channels/'+id,
    headers: {'Client-ID':'7xganf8cmv116235dcf9vcun4lcqvb'},
  }).then(function(response){
    console.log('inside of getChannel.then')
    res.send(response.data);
  })
});

passport.serializeUser(function(user, cb){
  cb(null, user);
});
passport.deserializeUser(function(obj, cb){
  cb(null, obj);
});

//listening..... on the port
app.listen(port, function(){
  console.log('listening on port ' + port)
})
