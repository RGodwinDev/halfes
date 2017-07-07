angular.module('app')
.controller('twitchUserCtrl', function($scope, $stateParams, twitchUserServ, $sce){
  let promise = twitchUserServ.getStream(parseInt($stateParams.id));
  promise.then(function(response){
    $scope.data = response.data;
    console.log(response.data);
    $scope.channelSource = $sce.trustAsResourceUrl('http://player.twitch.tv/?channel=' + response.data.name);
    $scope.chatSource = $sce.trustAsResourceUrl('http://www.twitch.tv/'+ response.data.name + '/chat');
    $scope.logo = response.data.logo;
  })
});
