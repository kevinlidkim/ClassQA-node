angular.module('ClassServ', []).factory('ClassService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  return {
    load_course: function(id) {
      var url = '/load_course/' + id;
      return $http.get(url)
        .then(function(data) {
          console.log("Successfully loaded course");
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
      //workaround to sending file as multiform data
      //name needs to be the same as in multer().single('')
      var fd = new FormData();
      fd.append('file', file);

      return $http.post('/upload_material', fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
      })
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
      return $http.post('/add_material', material)
        .then(function(data) {
          console.log("Successfully added and saved material");
          return data;
        })
        .catch(function(err) {
          console.log('Failed to save material');
          console.log(err);
        })
    },

    edit_material: function(material) {
      return $http.post('/edit_material', material)
        .then(function(data) {
          console.log("Successfully edited material");
          return data;
        })
        .catch(function(err) {
          console.log('Failed to edit material');
          console.log(err);
        })
    },

    delete_course: function(id) {
      return $http.delete('/delete_course/' + id)
        .then(function(data) {
          console.log("Successfully deleted course");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to delete course");
          console.log(err);
        })
    },

    delete_material: function(id) {
      return $http.delete('/delete_material/' + id)
        .then(function(data) {
          console.log("Successfully deleted material");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to delete material");
          console.log(err);
        })
    },

    filter_material: function(options) {

      return $http.post('/filter_material/', options)
        .then(function(data) {
          console.log("Successfully filtered material");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to filter material");
          console.log(err);
        })
    },

    add_announcement: function(announcement) {

      return $http.post('/add_announcement/', announcement)
        .then(function(data) {
          console.log("Successfully added announcement");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to add announcement");
          console.log(err);
        })
    }

  }

}]);
