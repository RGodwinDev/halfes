const twitchRouteCtrl = require('./twitchRouteCtrl.js')
const axios = require('axios');
const config = require('../../config');
module.exports = function(app){
  //cant do this as backend isnt in angular, just js?
  //answer: use axios, its pretty much the same as $http
  app.get('/api/getStreamers', function(req, res){
    //i need to get the dbInstance here somehow
    const db = app.get('db');
    let get25Promise = db.get25list();
    get25Promise.then(function(result){
      //result is array of userIds
      //get users from database with the ids
      //let get25UsersPromise = db.get25Users(result);
      // get25UsersPromise.then(function(resultUsers){
      //   res.send(resultUsers);
      // })
      res.send(result);
    })
  });
  app.get('/api/getChannel/:id', function(req, res){
    var urlOut = 'https://api.twitch.tv/kraken/channels/' + req.params.id;
    axios({
      method: 'GET',
      url: urlOut, //urlOut is above url based on parameter
      headers: {'Client-ID': config.Strategy.clientID,
    'Accept': 'application/vnd.twitchtv.v5+json'},
    }).then(function(response){
      console.log('watching - '+ response.data.display_name);
      res.send(response.data);
    }).catch(function(response){
      console.log('getchannel failed')
      console.log(response);
    })
  });

  app.get('/api/getUser/:name', function(req, res){
    console.log(req.params.name);
    var urlOut = 'https://api.twitch.tv/kraken/users/?login=' + req.params.name;
    axios({
      method: 'GET',
      url: urlOut, //urlOut is above url based on parameter
      headers: {'Client-ID': config.Strategy.clientID,
    'Accept': 'application/vnd.twitchtv.v5+json'},
    }).then(function(response){
      //if users array is longer than 0, it has something
      if(response.data.users.length > 0){
        //return that something
        res.send({userinfo:response.data.users[0],
        stat: 200});
      }
      else { //else return error code?
        res.send({failmode: 'Either user doesn\'t exist or was misspelled',
        stat: 400});
      }
    }).catch(function(err){
      console.log(err + " This is an error!!!");
      res.send({failmode: 'invalid',
      stat: 400});
    })
  });
}
