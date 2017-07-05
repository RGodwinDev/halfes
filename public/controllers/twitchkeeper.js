angular.module('app').controller('twitchCtrl', function($scope, twitchkeeperServ){
  $scope.test = "testing"
  let promise = twitchkeeperServ.getStreamers();

  promise.then(function(response){
    $scope.channels = response.data.streams
    console.log($scope.channels);
  });
});
