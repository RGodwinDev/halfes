const express = require('express');
const cors = require('cors');
const {json} = require('body-parser');
//port, probably need to change it if im going to have it hosted elsewhere
const port = 3000;
const massive = require('massive');
const session = require('express-session');
const config = require('./server/config');
// const passport = require('passport');
// const { Strategy } = require('passport-twitch');
const axios = require('axios'); //required in the route file
const masterRoutes = require('./server/masterRoutes');

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
  //get top 25 streamers, put them into database, make top25 list
  const getNew25List = function(){
    let promise25 = axios({
      method: 'GET',
      url: 'https://api.twitch.tv/kraken/streams/',
      headers: {'Client-ID':config.Strategy.clientID},
    }).then(function(response){
      //go through data, get the ids
      console.log(response.data.streams)
      let idArr = [];
      for(let i = 0; i < response.data.streams.length; ++i){
        idArr.push(response.data.streams[i].channel._id)
        //should also check if user exists in db or not, and insert their data if they dont.
        //i'll need to do async calls to do this
      }
      //put the array of ids into the database
      let list25 = dbInstance.insert25list(idArr);
      list25.then(function(result){
        //result is the array of objects in the form
        //[{userId: #}, {userId: #}, etc...] 25 user ids
        console.log(new Date() + ' new top 25 list');
        console.log(result);
      });
    }) //end of promise25.then
  } //end of getNew25List
    //do stuff other than promise25 with db here
  //run it once
  getNew25List();
  //run it every 5 minutes
  const minutes = 5;
  const interval = minutes * 60 * 1000;
  setInterval(function(){
    getNew25List();
  }, interval);
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
