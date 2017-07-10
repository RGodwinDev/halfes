angular.module('app').controller('twitchCtrl', function($scope, twitchkeeperServ, $location){
  $scope.test = "testing"
  let promise = twitchkeeperServ.getStreamers();

  promise.then(function(response){
    $scope.channels = response.data
    console.log($scope.channels);
  });
  $scope.test='The streams update every 5 minutes'
  //clicking search button gets the user from the input text
  //then goes to user view with the id from the data.
  $scope.buttonClick = function(){
    let userPromise = twitchkeeperServ.searchUser($scope.userSearchBox.toLowerCase());
    userPromise.then(function(response){
      console.log(response);
      //if status is good
      if(response.data.stat === 200){
        //goto user view with id
        let path = '/twitchkeeper/u/'+ response.data.userinfo._id;
        $location.path(path);
      }
      //else, not good response status
      $scope.test = response.data.failmode;
    });
  }
});
