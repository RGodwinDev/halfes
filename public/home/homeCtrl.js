angular.module('app').controller('homeCtrl', function($scope, homeServ, $interval){

    $scope.world = "Dallas";
    $scope.worldstyle = {
      'background-image': "url('./../assets/home/dallas-skyline.jpg')"
    }
    let wordarr = ['New York', 'San Francisco', 'Austin', 'Dallas'];
    let backgroundarr = ['./../assets/home/newyorkskyline.png', './../assets/home/sanfran.png',
     './../assets/home/atx-pano.jpg', './../assets/home/dallas-skyline.jpg']
    let num = 0;
    $interval(function(){
      $scope.world = wordarr[num];
      $scope.worldstyle={
        'background-image': "url('" + backgroundarr[num] + "')"
      };
      ++num;
      if(num === wordarr.length){
        num = 0;
      }
    }, 3000);

});
