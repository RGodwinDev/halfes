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
                if(Date.parse(superres.data[j].endtime)%86400000 < Date.parse(superres.data[j].starttime)%86400000){
                    superres.data[j].endtime = 86400000-1;
                    console.log('before edit');
                    console.log(superres.data[j].endtime);
                    superres.data[j].streamlength = (superres.data[j].endtime - (Date.parse(superres.data[j].starttime)%86400000))/86400000;
                    console.log('stream length with edit');
                    console.log(superres.data[j].streamlength);

                                    console.log('start time');
                                    console.log((parseInt(Date.parse(superres.data[j].starttime))%86400000));
                                    console.log('end time');
                                    console.log((superres.data[j].endtime%86400000));
                }
                else{
                    superres.data[j].streamlength = (Date.parse(superres.data[j].endtime) - Date.parse(superres.data[j].starttime)) / (1000 * 60 * 60 * 24);
                    console.log('stream length');
                    console.log(superres.data[j].streamlength);

                                    console.log('start time');
                                    console.log((parseInt(Date.parse(superres.data[j].starttime))%86400000));
                                    console.log('end time');
                                    console.log((parseInt(Date.parse(superres.data[j].endtime))%86400000));
                }

                // the j in the offset only works because the lines are 1 pixel tall. otherwise they wouldnt work i think?
                //if you change the height of the line, expect it to break.
                superres.data[j].yOffset = (parseInt((Date.parse(superres.data[j].starttime) - now)/ 86400000)/90) - ([j]/90);
                superres.data[j].xOffset = ((parseInt((Date.parse(superres.data[j].starttime) - now) % 86400000)/86400000));
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