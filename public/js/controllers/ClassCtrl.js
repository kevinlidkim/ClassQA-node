angular.module('ClassCtrl', []).controller('ClassController', ['$scope', '$location', '$routeParams', 'moment', 'MainService', 'ClassService', function($scope, $location, $routeParams, moment, MainService, ClassService) {

  $scope.class_id = "";

  $scope.class = {};
  $scope.class_materials = [];
  $scope.class_questions = [];

  load_class = function(id) {

    console.log("loading class with id: " + id);

    return ClassService.load_course(id)
      .then(function(data) {

        console.log("load_class response:");
        console.log(data);

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
    console.log('uploading.');
    ClassService.upload_material(file)
      .then(function(data) {
        console.log('AYY ' + data.data.id);
        //get the file_id and use it in save_material
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.save_material = function(id) {
    var title = document.getElementById("title").value;
    var description = document.getElementById("description").value;

    var material = {
      file_id: id,
      course_id: $scope.class_id,
      material_title: title,
      description: description
    }

    ClassService.add_material(material)
      .then(function(data) {
        console.log('ayy');
        //update view to have new material
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.load_qaPage = function() {
    $location.path('/qaPage');
  }

  load_class($routeParams.id);

}]);
