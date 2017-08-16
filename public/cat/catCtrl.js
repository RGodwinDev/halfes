angular.module('app').controller('catCtrl', function($scope, catServ){
 $scope.test = "Here is a random cat";

 let promise = catServ.getCat();
 promise.then(function(res){
   $scope.caturl = res.data.file;

 })
});
