angular.module('UserCtrl', []).controller('UserController', ['$scope', '$location', 'moment', 'MainService', 'UserService', function($scope, $location, moment, MainService, UserService) {

  $scope.is_logged_in = function() {
    return UserService.is_auth();
  }

  
}]);

