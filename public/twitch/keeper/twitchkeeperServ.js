angular.module('app')
.service('twitchkeeperServ', function($http){

  this.getStreamers = function(){ //gets top25
    return $http.get('/api/getStreamers')
  }
  this.searchUser = function(name){ //gets a single user by name
    //this kills any spaces in the name
    name = name.split(' ').join('');
    return $http.get('/api/getUser/' + name)
  }
  this.getclosedStreams = function(id){ //gets the closedstreams of a single streamer
      return $http.get('/api/getClosed/' + id);
  }
})
