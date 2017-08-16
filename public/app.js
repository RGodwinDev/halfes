angular.module('app', ['ui.router'])
.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('home', {
    url: '/',
    templateUrl:'./home/home.html',
    controller:'homeCtrl'
  })
  .state('login', {
    url: '/login',
    templateUrl: './views/login.html',
    controller:'loginCtrl'
  })
  .state('twitch', {
    url: '/twitchkeeper',
    templateUrl: './twitch/twitchkeeper.html',
    controller: 'twitchCtrl'
  })
  .state('twitchuser', {
    url: '/twitchkeeper/u/:id',
    templateUrl: './twitch/twitchUser.html',
    controller: 'twitchUserCtrl'
  })
  .state('cat', {
      url: '/cat',
      templateUrl: './cat/cat.html',
      controller: 'catCtrl'
  })
})
