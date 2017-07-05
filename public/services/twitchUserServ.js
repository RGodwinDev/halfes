angular.module('app').service('twitchUserServ', function($http){

  this.getStream = function(id){
    console.log('inside of getChannel')
    return $http.get('/api/getChannel/'+ id)
  }
});
