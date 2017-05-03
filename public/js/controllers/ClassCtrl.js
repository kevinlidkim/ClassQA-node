angular.module('ClassCtrl', []).controller('ClassController', ['$scope', '$location', '$routeParams', 'moment', 'MainService', 'ClassService', function($scope, $location, $routeParams, moment, MainService, ClassService) {

  // Id of class object, used to reference to backend
  $scope.class_id = "";

  // class currently being accessed
  $scope.class = {};
  // Array Of Materials for the class being accessed
  $scope.class_materials = [];
  // Array Of questions for the class Material being accessed
  $scope.class_questions = [];

  load_class = function(id) {

    console.log("loading class with id: " + id);

    return ClassService.load_course(id)
      .then(function(data) {
        $scope.class_id = id;
        $scope.class = data.data.data.course;
        $scope.class_materials = data.data.data.course_materials;
        $scope.class_questions = data.data.data.questions;
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.edit_class = function() {
    var courseToEdit = {
      id: $scope.class_id,
      name: $scope.class.name,
      department: $scope.class.department,
      code: $scope.class.code,
      section: $scope.class.section,
      password: $scope.class.password,
      description: $scope.class.description,
    }

    ClassService.edit_course(courseToEdit)
      .then(function(data) {

      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.upload_material = function() {
    var file = document.getElementById("doc").files[0];
    ClassService.upload_material(file)
      .then(function(data) {
        var id = data.data.id;
        var mimetype = data.data.mimetype;
        $scope.save_material(id, mimetype);
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.save_material = function(id, mimetype) {
    var title = document.getElementById("title").value;
    var description = document.getElementById("description").value;

    var material = {
      file_id: id,
      mimetype: mimetype,
      course_id: $scope.class_id,
      title: title,
      description: description
      
    }

    ClassService.add_material(material)
      .then(function(data) {
        console.log(data);
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.load_qaPage = function(id) {
    $location.path('/qaPage/' + id);
  }

  load_class($routeParams.id);

}]);
