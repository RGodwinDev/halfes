angular.module('app').service('homeServ', function($http){

  this.getpuppy = function(){
    return $http.get('/api/getpuppy');
  }
})
