const twitchRouteCtrl = require('./twitchRouteCtrl.js')
const axios = require('axios');
const config = require('../../config');
module.exports = function(app){
    //cant do this as backend isnt in angular, just js?
    //answer: use axios, its pretty much the same as $http
    //gets top 25 streamers
    app.get('/api/getStreamers', function(req, res){
        //i need to get the dbInstance here somehow
        const db = app.get('db');
        let get25Promise = db.get25list();
        get25Promise.then(function(result){
            //result is array of objects with userIds propertys
            let idArr = [];
            for(let i = 0; i < result.length; ++i){
                idArr.push(result[i].userid);
            }
            //get users from database with the ids
            let get25UsersPromise = db.get25Users(idArr);
            get25UsersPromise.then(function(resultUsers){
                res.send(resultUsers);
            })
        }) //end of get25Promise
    }); //end of get /api/getStreamers

    app.get('/api/getChannel/:id', function(req, res){
        const db = app.get('db');
        let getChannelPromise = db.getUser([req.params.id]);
        getChannelPromise.then(function(userRes){
            if(userRes.length > 0){ //user exists
                // console.log(userRes);
                res.send(userRes);
            }
            else { //user doesn't exist, create one
                const urlOut = 'https://api.twitch.tv/kraken/channels/' + req.params.id;
                axios({
                    method: 'GET',
                    url: urlOut, //urlOut is above url based on parameter
                    headers: {'Client-ID': config.Strategy.clientID,
                    'Accept': 'application/vnd.twitchtv.v5+json'},
                }).then(function(response){
                    console.log('watching - '+ response.data.display_name);
                    let uArr = [];
                    uArr.push(response.data._id);
                    uArr.push(response.data.name);
                    uArr.push(response.data.display_name);
                    uArr.push(response.data.logo);
                    uArr.push(response.data.game);
                    uArr.push(true);
                    let newUserPromise = db.insertNewUser(uArr);
                    newUserPromise.then(function(){
                        console.log('created new user');
                        let getNewUserPromise = db.getUser(uArr[0]);
                        getNewUserPromise.then(function(incoming){
                            console.log(incoming);
                            res.send(incoming);
                        })
                    }); //end of newUserPromise.then
                }).catch(function(response){
                    console.log('getchannel failed')
                    console.log(response);
                });//end of axios.catch
            }//end of else
        });//end of getChannelPromise.then
    }); //end of get /api/getChannel/:id



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



    app.get('/api/getClosed/:id', function(req, res){
        //id is the id of the user that you want the closedstreams of
        //get the db from the app
        const dbInstance = app.get('db');
        let promise = dbInstance.getClosedStreamsbyUser(req.params.id);
        promise.then(function(response){
            //response is an array of closedstreams objects [cs, cs, cs]
            //a closedstream object looks like
            //{userid: #, starttime: timestamp, endtime: timestamp, streamid: #}
            res.send(response);
        })
    })
}
