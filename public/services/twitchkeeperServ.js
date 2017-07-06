angular.module('app')
.service('twitchkeeperServ', function($http){

  this.getStreamers = function(){
    return $http.get('/api/getStreamers')
  }
  this.searchUser = function(name){
    console.log(name +' in service');
    return $http.get('/api/getUser/' + name)
  }
})
