angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		.when('/', {
			redirectTo: '/home',
      access: {restricted: true}
		})

    .when('/home', {
      templateUrl: 'views/home.html',
      controller: 'UserController',
      access: {restricted: true}
    })

		.when('/signup', {
			templateUrl: 'views/signup.html',
			controller: 'MainController',
			access: {restricted: false}
		})

		.when('/login', {
			templateUrl: 'views/login.html',
			controller: 'MainController',
			access: {restricted: false}
		})

		.when('/classPage/:id', {
			templateUrl: 'views/classPage.html',
			controller: 'ClassController',
			access: {restricted: true}
		})

		.when('/qaPage', {
			templateUrl: 'views/qaPage.html',
			controller: 'MainController',
			access: {restricted: true}
		})

		.otherwise({
      redirectTo: '/home'
    });

	$locationProvider.html5Mode(true);



}])

.run(function ($rootScope, $location, $route, UserService) {
  $rootScope.$on('$routeChangeStart',
    function (event, next, current) {
      UserService.get_user_status()
        .then(function() {
          if (next.access.restricted && UserService.is_auth() === false) {
            $location.path('/login');
            $route.reload();
          }
        });
  });
});
