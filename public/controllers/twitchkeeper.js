angular.module('app').controller('twitchCtrl', function($scope, twitchkeeperServ, $location){
  let promise = twitchkeeperServ.getStreamers();
  promise.then(function(response){
    $scope.channels = response.data;
    console.log(response.data);
    for(let i = 0; i < response.data.length; ++i){
        let superpromise = twitchkeeperServ.getclosedStreams(response.data[i].userid);
        superpromise.then(function(superres){

            //calculate the length of each stream, and add it to them.
            for(let j = 0; j < superres.data.length; ++j){
                superres.data[j].streamlength = (Date.parse(superres.data[j].endtime) - Date.parse(superres.data[j].starttime)) / (1000 * 60 * 60 * 24);
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
