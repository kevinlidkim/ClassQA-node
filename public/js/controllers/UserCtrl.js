angular.module('UserCtrl', []).controller('UserController', ['$scope', '$location', 'moment', 'MainService', 'UserService', function($scope, $location, moment, MainService, UserService) {

  $scope.logged_in_user = "Name";

  $scope.is_logged_in = function() {
    return UserService.is_auth();
  }

  get_user_data = function() {
    UserService.get_user_data()
      .then(function(data) {
        $scope.logged_in_user = data.data.user;
      })
      .catch(function(err) {
        console.log('No user logged in');
      })
  }


  get_user_data();

}]);
