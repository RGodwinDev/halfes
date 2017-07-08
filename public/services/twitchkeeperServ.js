angular.module('app')
.service('twitchkeeperServ', function($http){

  this.getStreamers = function(){
    return $http.get('/api/getStreamers')
  }
  this.searchUser = function(name){
    //this kills any spaces in the name
    name = name.split(' ').join('');
    return $http.get('/api/getUser/' + name)
  }
})
