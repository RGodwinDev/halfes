const axios = require('axios');
const config = require('../../config');

module.exports = function(app){
  const dbInstance = app.get('db');

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

        //userArr takes in userid, name, display_name, logo, game, tracking, viewers. Gives it to userPromise
        let userArr = [];
        userArr.push(response.data.streams[i].channel._id);
        userArr.push(response.data.streams[i].channel.name);
        userArr.push(response.data.streams[i].channel.display_name);
        userArr.push(response.data.streams[i].channel.logo);
        userArr.push(response.data.streams[i].channel.game);
        //default tracking status, true
        userArr.push(true);
        userArr.push(response.data.streams[i].viewers)

        let userPromise = dbInstance.getUser(userArr[0]);
        userPromise.then(function(userRes){
          if(userRes.length > 0){ //if the user exists, update it with the userArr data
            dbInstance.updateUser(userArr);
          }//end if
          else { //if the user doesn't exist, create a new one
           dbInstance.insertNewUserViewers(userArr);
           console.log('creating new user');
         }//end else
        }).catch(function(err){ //end of userPromise.then
          console.log(err);
        }) //end of userPromise.catch
      }//end for loop
      //put the array of ids into the database
      let list25 = dbInstance.insert25list(idArr);
      list25.then(function(result){
        //result is the array of objects in the form
        //[{userId: #}, {userId: #}, etc...] 25 user ids
        console.log(new Date() + ' new top 25 list');
      }).catch(function(err){
        console.log('failed to insert into db');
      }); //end of list25.catch
    }).catch(function(err){
      console.log(err);
    }) //end of promise25.then
  } //end of getNew25List function
  //do stuff other than promise25 with db here
  //run it once
  getNew25List();
  //run it every 5 minutes
  const minutes = 5;
  const interval = minutes * 60 * 1000;
  setInterval(function(){
    getNew25List();
  }, interval);



  //checking if streams are live or not----//
  //still inside massive function...
  const liveCheck = function(){
    let promise = dbInstance.getTrackedUsers();
    promise.then(function(response){
      let streamspromise = dbInstance.getOpenStreams();
        streamspromise.then(function(streamsres){
          //streamsres is an array of openstream objects, [openstream, openstream, openstream, etc...]
          //openstream object looks like {userid: bigint, streamid: bigint, start: text}
          //sort streamsres by streamid
          streamsres.sort(function(a,b){return parseInt(a.userid) - parseInt(b.userid)});
          response.sort(function(a,b){return parseInt(a.userid) - parseInt(b.userid)})
          //response should be sorted now
          let newstreams = 0;
          let slices = 0;
          twitchStreamsArr = [];
          while(response.length > 0){
            //queryOut is inside while loop because it needs to reset each time.
            let queryOut = "https://api.twitch.tv/kraken/streams/?limit=100&channel=";
            for(let i = 0; i < 99 && response.length > 0; ++i){
              let obj = response.shift();
              queryOut += "," + obj.userid;
            } //end for loop

            //get streams from twitch
            axios({
              method:'GET',
              url:queryOut,
              timeout:3000,
              headers:{'Client-ID': config.Strategy.clientID,
              'Accept': 'application/vnd.twitchtv.v5+json'},
            }).then(function(queryResponse){ //queryResponse is the response from twitch, up to 99 streams, but probably less.
              //queryResponse is an array of streams [stream, stream, stream, etc...]
              for(let b = 0; b < queryResponse.data.streams.length; ++b){
                twitchStreamsArr.push(queryResponse.data.streams[b]);
              }

          })
          .catch(function(err){
            console.log(err);
          })//end twitch axios.then ---------!
        } //end while loop ------------!
        setTimeout(function(){

          //sort by their streamid

          twitchStreamsArr.sort(function(a,b){return a.channel._id - b.channel._id});
          let testarr = [];
          for(let i = 0; i < twitchStreamsArr.length; ++i){
            testarr.push(twitchStreamsArr[i].channel._id);
          }
          indextwitchstreams = 0;
          indexopenstreams = 0;

          //while indexes are less than their respective arrays
          while (indexopenstreams < streamsres.length && indextwitchstreams < twitchStreamsArr.length){
            if(parseInt(streamsres[indexopenstreams].userid) === twitchStreamsArr[indextwitchstreams].channel._id){
              //if ids are equal, take them out
              let dbslice = streamsres.splice(indexopenstreams, 1);
              let twitchslice = twitchStreamsArr.splice(indextwitchstreams, 1);
              ++slices;

            } //if db id is < twitch id
            else if(parseInt(streamsres[indexopenstreams].userid) > twitchStreamsArr[indextwitchstreams].channel._id){
              ++indextwitchstreams;
            } //end elseif db id is > twitch id
            else{
              ++indexopenstreams;
            } //end else
          }//end while loop indexcompare to length
          //put leftover streams into the db
          for(let t = 0; t < twitchStreamsArr.length; ++t){
            openuserarr = [];
            openuserarr.push(twitchStreamsArr[t].channel._id);
            openuserarr.push(twitchStreamsArr[t].created_at);
            openuserarr.push(twitchStreamsArr[t]._id);
            dbInstance.openStream(openuserarr);
            ++newstreams;
          }//end for loop
          let count = 0;
          //take leftover db streams out
          for(let s = 0; s < streamsres.length; ++s){
            //get leftover openstreams, and insert them into closedstream
            dbInstance.getOpenStream(parseInt(streamsres[s].userid))
            .then(function(response){
              //response is an array with anon obj -> [obj]
              //obj looks like {userid: #, streamid: #, start: #}

              let tobeclosedArr = [];
              tobeclosedArr.push(response[0].userid);
              tobeclosedArr.push(response[0].start);
              tobeclosedArr.push(response[0].streamid);
              tobeclosedArr.push(new Date());
              dbInstance.insertClosedStream(tobeclosedArr);
              //if you see more 'closed stream' after the console logs, it took longer than 1 second to complete
              console.log('closed stream');


              dbInstance.closeStream(parseInt(streamsres[s].userid));
              ++count;
            });


          }//end forloop
          setTimeout(function(){
          console.log(newstreams + " opened streams");
          console.log(count + " closed streams");
          console.log(newstreams - count + " net change streams");
          console.log(slices + " streams that stayed in db and did nothing");
          console.log(newstreams + slices + " should be in db now")
        }, 1000);
        }, 5000); //end timeout
      });//end of streamspromise.then getopenstreams
    })//end getTrackedUsers promise.then
  }//end of liveCheck function ------------////

  liveCheck();
  setInterval(function(){
    liveCheck();
  }, interval);

}
