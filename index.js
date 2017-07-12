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
      // console.log(response.data.streams)
      let idArr = [];
      for(let i = 0; i < response.data.streams.length; ++i){
        idArr.push(response.data.streams[i].channel._id)

        //should also check if user exists in db or not, and insert their data if they dont.
        let userArr = [];
        userArr.push(response.data.streams[i].channel._id);
        userArr.push(response.data.streams[i].channel.name);
        userArr.push(response.data.streams[i].channel.display_name);
        userArr.push(response.data.streams[i].channel.logo);
        userArr.push(response.data.streams[i].channel.game);
        //default tracking status, true
        userArr.push(true);
        // console.log(userArr);
        userArr.push(response.data.streams[i].viewers)

        let userPromise = dbInstance.getUser(userArr[0]);

        userPromise.then(function(userRes){
          if(userRes.length > 0){ //if the user exists, update it with the userArr data
            dbInstance.updateUser(userArr);
          }
          else { //if the user doesn't exist, create a new one
           dbInstance.insertNewUserViewers(userArr);
           console.log('creating new user');
          }
        })

      }
      //put the array of ids into the database
      let list25 = dbInstance.insert25list(idArr);
      list25.then(function(result){
        //result is the array of objects in the form
        //[{userId: #}, {userId: #}, etc...] 25 user ids
        console.log(new Date() + ' new top 25 list');
        // console.log(result);
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

  const liveCheck = function(){
    let promise = dbInstance.getTrackedUsers();
    promise.then(function(response){
      console.log(response);
      while(response.length > 0){
        //queryOut is inside while loop because it needs to reset each time.
        let queryOut = "https://api.twitch.tv/kraken/streams/?limit=100&channel=";
        for(let i = 0; i < 99 && response.length > 0; ++i){
          let obj = response.shift();
          queryOut += "," + obj.userid;
        } //end for loop
        axios({
          method:'GET',
          url:queryOut,
          headers:{'Client-ID': config.Strategy.clientID,
          'Accept': 'application/vnd.twitchtv.v5+json'},
        }).then(function(queryResponse){ //queryResponse is the response from twitch, up to 99 streams, but probably less.
          //queryResponse is an array of streams [stream, stream, stream, etc...]
          for(let b = 0; b < queryResponse.data.streams.length; ++b){
            // console.log(queryResponse.data.streams[b]);
          }
        });
      }//end of while loop
    })

  }//end of liveCheck function
  liveCheck();
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
