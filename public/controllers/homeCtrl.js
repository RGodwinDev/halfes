angular.module('app').controller('homeCtrl', function($scope, homeServ){
 $scope.test = "Here is a random Pupper";

 let promise = homeServ.getpuppy();
 promise.then(function(res){
   $scope.pupurl = res.data

 })
});
