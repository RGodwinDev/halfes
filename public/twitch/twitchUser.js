angular.module('app')
.controller('twitchUserCtrl', function($scope, $stateParams, twitchUserServ, $sce){
  let promise = twitchUserServ.getStream(parseInt($stateParams.id));
  promise.then(function(response){
    $scope.data = response.data;
    // console.log(response);
    $scope.channelSource = $sce.trustAsResourceUrl('http://player.twitch.tv/?channel=' + response.data[0].name);
    $scope.chatSource = $sce.trustAsResourceUrl('http://www.twitch.tv/'+ response.data[0].name + '/chat');
    $scope.logo = response.data[0].logo;
  })
});
