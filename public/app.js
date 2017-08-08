angular.module('app', ['ui.router'])
.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('home', {
    url: '/',
    templateUrl:'./views/home.html',
    controller:'homeCtrl'
  })
  .state('login', {
    url: '/login',
    templateUrl: './views/login.html',
    controller:'loginCtrl'
  })
  .state('twitch', {
    url: '/twitchkeeper',
    templateUrl: './views/twitchkeeper.html',
    controller: 'twitchCtrl'
  })
  .state('twitchuser', {
    url: '/twitchkeeper/u/:id',
    templateUrl: './views/twitchUser.html',
    controller: 'twitchUserCtrl'
  })
  .state('cat', {
      url: '/cat',
      templateUrl: './views/cat.html',
      controller: 'catCtrl'
  })
})
