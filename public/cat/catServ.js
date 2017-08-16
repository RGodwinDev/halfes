angular.module('app').service('catServ', function($http){

  this.getCat = function(){
    return $http.get('/api/getCat');
  }
})
