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
  }

  get_course_stat = function(id) {

    UserService.get_course_stat(id)
      .then(function(data) {
        console.log("course stats:");
        console.log(data.data.statistics);
      })
  }


  get_user_data();

}]);
