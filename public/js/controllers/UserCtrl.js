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

  get_course_stat = function(id) {

    UserService.get_course_stat(id)
      .then(function(data) {
        console.log("course stats:");
        console.log(data.data.statistics);
      })
  }

  $scope.change_password = function() {
    var passwords = {
      old_password: $scope.old_password,
      new_password: $scope.new_password
    }

    UserService.change_password(passwords)
      .then(function(data) {

      })
      .catch(function(err) {
        
      })
  }


  get_user_data();

}]);
