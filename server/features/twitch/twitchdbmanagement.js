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
          streamsres.sort(function(a,b){return parseInt(a.streamid) - parseInt(b.streamid)});
          response.sort(function(a,b){return parseInt(a.streamid) - parseInt(b.streamid)})
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
              timeout:10000,
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

          twitchStreamsArr.sort(function(a,b){return a._id - b._id});
          let testarr = [];
          for(let i = 0; i < twitchStreamsArr.length; ++i){
            testarr.push(twitchStreamsArr[i]._id);
          }
          indextwitchstreams = 0;
          indexopenstreams = 0;

          //while indexes are less than their respective arrays
          while (indexopenstreams < streamsres.length && indextwitchstreams < twitchStreamsArr.length){
            if(parseInt(streamsres[indexopenstreams].streamid) === twitchStreamsArr[indextwitchstreams]._id){
              //if ids are equal, take them out
              let dbslice = streamsres.splice(indexopenstreams, 1);
              let twitchslice = twitchStreamsArr.splice(indextwitchstreams, 1);
              ++slices;

            } //if db id is < twitch id
            else if(parseInt(streamsres[indexopenstreams].streamid) > twitchStreamsArr[indextwitchstreams]._id){
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
        }, 30000); //end timeout
      });//end of streamspromise.then getopenstreams
    })//end getTrackedUsers promise.then
  }//end of liveCheck function ------------////

  liveCheck();
  setInterval(function(){
    liveCheck();
  }, interval); //interval is 5 min







  //this is essentially 2 functions in 1 that uses the same array
  //culls extra closed streams from the db
  //also culls ones that are older than 90 days (about 3 months)
  function closedStreamCull(){
    //get closed streams sorted by streamid. All of them!
    //maybe in the future, make it so it only grabs the streams from userid.
    //so as to limit the number being pulled from the db, so it doesnt overwhelm the server.
    let promise = dbInstance.getclosedstreams();
    //should be sorted by streamid coming from db because we sort by streamid in the sql.
    promise.then(function(response){ //response.data is an array of closed streams. [cs, cs, cs, cs, etc...]
      // for(let i = 0; i < response.length; ++i){
      //   console.log(response[i].endtime + ' has a value of ' + response[i].endtime.valueOf());
      //   console.log(response[i].starttime + ' has a value of ' + response[i].starttime.valueOf());
      //   console.log('the stream lasted ' + (response[i].endtime.valueOf() - response[i].starttime.valueOf()) + 'msec');
      // }

      let day = 1000 * 60 * 60 * 24;
      let days = 90 * day;
      let now = new Date();
      let cutoff = now - days;

      //remove streams over a certain age
      let j = 0;
      while(j < response.length){
        if(response[j].endtime < cutoff){ //if endtime < cutoff time, its older than 90 days

          let closedarr = [];
          closedarr.push(response[j].streamid);q
          closedarr.push(response[j].endtime);

          //remove closedstream as its too old
          dbInstance.removeclosedstream(closedarr).then(function(){
            console.log('removed closed stream due to age');
          }).catch(function(){
            console.log('failed to remove old closed stream')
          });
          //remove from the array too, because thats smart
          response.splice(j,1);
        }else{ //if endtime is less than 90 days, go to the next one
          ++j;
        }
      }


      for(let i = 1; i < response.length; ++i){
        //if streamid is the same
        // console.log(response[i].streamid + " " + response[i - 1].streamid)
        // console.log(response[i].streamid === response[i - 1].streamid)
        if(response[i].streamid === response[i - 1].streamid){
          //check which one has later endtime
          //if i.end - i-1.end is > 0, i ended later, keep it
          let closedstream;
          if(response[i].endtime - response[i-1].endtime > 0){ //if i is bigger than i-1
            closedstream = response[i-1]; //set i-1 to be the deleted one
          } else { //i-1 is bigger or even, delete i
            closedstream = response[i];
          }
          //put earlier closedstream streamid and endtime into closedarr
          let closedarr = [];
          closedarr.push(closedstream.streamid);
          closedarr.push(closedstream.endtime);

          //remove the one with the earlier endtime
          dbInstance.removeclosedstream(closedarr).then(function(){
            console.log('removed closed stream due to being a duplicate');
          }).catch(function(){
            console.log('failed to remove old closed stream')
          });
        }//end if
      }//end forloop
    })//end promise.then

  }//end closedStreamCull function
  closedStreamCull();
  //this only runs once, at server boot
  //unless we want to set an interval
  setInterval(function(){
    closedStreamCull();
  }, interval * 12); //interval is 5 min, * 12 = once an 1 hour
}
