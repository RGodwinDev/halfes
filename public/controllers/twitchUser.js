angular.module('app')
.controller('twitchUserCtrl', function($scope, $stateParams, twitchUserServ){
  let promise = twitchUserServ.getStream(parseInt($stateParams.id));
  promise.then(function(response){
    console.log(response);
  })
});
