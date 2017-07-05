angular.module('app')
.service('twitchkeeperServ', function($http){

  this.getStreamers = function(){
    return $http.get('/api/getStreamers')
  }
  
})
