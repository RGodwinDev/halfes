angular.module('app').controller('twitchCtrl', function($scope, twitchkeeperServ, $location){
  let promise = twitchkeeperServ.getStreamers();

  //get channels
  promise.then(function(response){
    $scope.channels = response.data;
    console.log(response.data);
    //now is now, but 90 days ago
    let now = Date.parse(new Date()) - (86400000 * 90);

    for(let i = 0; i < response.data.length; ++i){
        let superpromise = twitchkeeperServ.getclosedStreams(response.data[i].userid);
        superpromise.then(function(superres){


            //calculate the specifics of each stream, and add it to them.
            for(let j = 0; j < superres.data.length; ++j){
              //if endtime doesnt end on same day as starttime
                if(parseInt(Date.parse(superres.data[j].endtime)/86400000) !== parseInt(Date.parse(superres.data[j].starttime)/86400000)){


                  //make endtime be 24 hours - 1 ms, 86399999ms
                  //TODO: make more streams, so they continue on the other side, starting from 0.

                    //endtime = endtime from current j stream
                    //starttime = current starttime + whatever is needed to make it to 86400000
                    //streamid = same
                    //userid = same




                    superres.data.push();
                  //make it have startime of 0, and endtime of the stream
                  //will it be able to go in the correct place? idk, we'll see
                    superres.data[j].endtime = 86400000-1;
                    console.log('before edit');
                    console.log('---endtime---')
                    console.log(superres.data[j].endtime);
                    //length is (endtime - (starttime%86400000)) / 86400000, making it a length between 0 and 1.
                    superres.data[j].streamlength = (superres.data[j].endtime - (Date.parse(superres.data[j].starttime)%86400000))/86400000;
                    console.log('stream length with edit');
                    console.log(superres.data[j].streamlength);

                                    console.log('start time');
                                    console.log((parseInt(Date.parse(superres.data[j].starttime))%86400000));
                                    console.log('end time');
                                    console.log((superres.data[j].endtime%86400000));
                }
                //endtime doesnt have less ms than starttime
                else{
                    superres.data[j].streamlength = (Date.parse(superres.data[j].endtime) - Date.parse(superres.data[j].starttime)) / (1000 * 60 * 60 * 24);
                    console.log('stream length');
                    console.log(superres.data[j].streamlength);

                                    console.log('start time');
                                    console.log((parseInt(Date.parse(superres.data[j].starttime))%86400000));
                                    console.log('end time');
                                    console.log((parseInt(Date.parse(superres.data[j].endtime))%86400000));
                }

                //yoffset is (starttime - all time up to 90 days ago), which should be jan1 1970, until 90 days ago, in ms
                // divide by 1 day in ms, to make it into how many days, since 90 days ago.
                // divide by 90 to make into a number between 0 and 1.
                // subtract j/90, so that its placement isnt affected by where it is in the array. this only works because each stream is 1 pixel tall.
                //expect this to break if you change the line thickness
                superres.data[j].yOffset = (parseInt((Date.parse(superres.data[j].starttime) - now)/ 86400000)/90) - ([j]/90);

                //xoffset is (starttime % 86400000) / 86400000, which makes it between 0 and 1
                superres.data[j].xOffset = ((parseInt(Date.parse(superres.data[j].starttime) % 86400000)/86400000));
                // console.log(superres.data[j].starttime)
                // console.log(superres.data[j].yOffset);
                // console.log(superres.data[j].xOffset);
                console.log('done -------------------------------------------------------');
            }

            //put the streams into their respective channel
            $scope.channels[i].streams = superres.data;
            // console.log(Date.parse(superres.data[0].endtime) - Date.parse(superres.data[0].starttime));

        });
    }
  });
  $scope.test='The streams update every 5 minutes'
  //clicking search button gets the user from the input text
  //then goes to user view with the id from the data.
  $scope.buttonClick = function(){
    let userPromise = twitchkeeperServ.searchUser($scope.userSearchBox.toLowerCase());
    userPromise.then(function(response){
      //if status is good
      if(response.data.stat === 200){
        //goto user view with id
        let path = '/twitchkeeper/u/'+ response.data.userinfo._id;
        $location.path(path);
      } //end if
      //else, not good response status
      $scope.test = response.data.failmode;
    }); //end userPromise.then
  } //end buttonclick function



}); //end twitchCtrl
