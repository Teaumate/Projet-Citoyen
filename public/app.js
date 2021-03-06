angular.module('mainApp', ['mainCtrlModule', 'AUD', 'adminModule', 'ui.bootstrap', 'ngRoute', 'ngTouch', 'addGarbage', 'addUserCtrl', 'geolocation', 'gservice'])
  .config(['$locationProvider', '$routeProvider', '$httpProvider', function config($locationProvider, $routeProvider, $httpProvider) {
      $locationProvider.hashPrefix('!');
    //================================================
    // Check if the user is connected
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').then(function(user){
        // Authenticated
        if (user.data !== '0'){
          /*$timeout(deferred.resolve, 0);*/
          console.log($location.path());
          deferred.resolve();

        // Not Authenticated
      }else {
          console.log($location.path());
          $rootScope.message = 'You need to log in.';
          //$timeout(function(){deferred.reject();}, 0);
          deferred.reject();
          $location.url('/main');
        }
      });

      return deferred.promise;
    };
    //================================================
    var checkAdmin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/isAdmin').then(function(user){
        // Authenticated
        if (user.data !== '0'){
          /*$timeout(deferred.resolve, 0);*/
          console.log($location.path());
          deferred.resolve();

        // Not Authenticated
      }else {
          console.log($location.path());
          $rootScope.message = 'You need to log in.';
          //$timeout(function(){deferred.reject();}, 0);
          deferred.reject();
          $location.url('/main');
        }
      });

      return deferred.promise;
    };
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.interceptors.push(function($q, $location) {
      return {
        response: function(response) {
          // do something on success
          return response;
        },
        responseError: function(response) {
          if (response.status === 401)
            $location.url('/login');
          return $q.reject(response);
        }
      };
    });
    //================================================

    //================================================
    // Define all the routes
    //================================================
      $routeProvider.
        when('/admin', {
          controller: 'adminCtrl',
          templateUrl: 'views/admin.html',
          resolve: {
            loggedin: checkAdmin
          }
        }).
        when('/main', {
          controller: 'mainControl',
          templateUrl: 'views/main.html'          
        }).
        when('/rdv', {
          controller: 'addUserCtrl',
          templateUrl: 'views/rdv.html'
        }).
        when('/mobile', {
            controller: 'addGarbageCtrl',
            templateUrl: 'views/mobile.html'
        }).
        otherwise('/main');
    }
  ]) // end of config()
  .run(function($rootScope, $http){
      $rootScope.message = '';

      // Logout function is available in any pages
      $rootScope.logout = function(){
        $rootScope.message = 'Logged out.';
        $http.post('/logout');
      };
  });