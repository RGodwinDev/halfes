angular.module('app').controller('twitchCtrl', function($scope, twitchkeeperServ, $location){
  let promise = twitchkeeperServ.getStreamers();
  promise.then(function(response){
    $scope.channels = response.data;
    console.log($scope.channels);
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


  let test = twitchkeeperServ.getclosedStreams(26490481);
  test.then(function(response){
      console.log(response);
  })
}); //end twitchCtrl
