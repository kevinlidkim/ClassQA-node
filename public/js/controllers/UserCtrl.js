angular.module('UserCtrl', []).controller('UserController', ['$scope', '$location', 'moment', 'MainService', 'UserService', function($scope, $location, moment, MainService, UserService) {

  // variable used to display name on navbar
  $scope.logged_in_user = "Name";

  // check if there is a user logged in
  $scope.is_logged_in = function() {
    // calls method in user service
    return UserService.is_auth();
  }

  // calls service to get user data
  get_user_data = function() {
    // calls method in user service
    UserService.get_user_data()
      .then(function(data) {
        // save user name for frontend display
        $scope.logged_in_user = data.data.user;
      })
      .catch(function(err) {
        console.log('No user logged in');
      })
  }

  // calls service to get course stats with id id
  get_course_stat = function(id) {
    // calls method in user service
    UserService.get_course_stat(id)
      .then(function(data) {
        // console.log("course stats:");
        // console.log(data.data.statistics);
      })
  }

  get_user_data();

}]);
