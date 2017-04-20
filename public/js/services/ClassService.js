angular.module('ClassServ', []).factory('ClassService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  return {
    load_course: function(id) {
      var url = '/load_course/' + id;
      return $http.get(url)
        .then(function(data) {
          console.log("Successfully selected course");
          console.log(data);
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })
    },

    edit_course: function(courseToEdit) {
      return $http.post('/edit_course', courseToEdit)
        .then(function(data) {
          console.log("Successfully edited course");
          console.log(data);// maybe i dont need to return data?
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })
    },

    upload_material: function(file) {
      console.log('uploading...');
      return $http.post('/upload_material', file)
        .then(function(data) {
          console.log("Successfully uploaded material");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to upload material");
          console.log(err);
        })
    },

    add_material: function(material) {
      //material is {file_id: '', course_id: '', material_title: '', description: ''}
      return $http.post('/add_material', material)
        .then(function(data) {
          console.log("Successfully added and saved material");
          return data;
        })
        .catch(function(err) {
          console.log('Failed to save material');
          console.log(err);
        })
    }

  }

}]);
