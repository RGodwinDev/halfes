angular.module('app').service('twitchUserServ', function($http){

  this.getStream = function(id){
    return $http.get('/api/getChannel/'+ id)
  }
  this.getClosedStreams = function(id){
    return $http.get('/api/getClosed/'+ id)
  }
});
