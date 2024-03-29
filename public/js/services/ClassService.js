angular.module('ClassServ', []).factory('ClassService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  return {
    // Function that returns a course given a course id
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

    // Function that sends info to edit a course and returns the edited course 
    edit_course: function(courseToEdit) {
      return $http.post('/edit_course', courseToEdit)
        .then(function(data) {
          alert(data.data.message);
          console.log(data);
          return data;
        })
        .catch(function(err) {
          alert(data.data.error);
          console.log(err);
        })
    },

    // Function that sends a file to backend and returns the response data
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

    // Function that sends materials to backend and returns the response data
    add_material: function(material) {
      return $http.post('/add_material', material)
        .then(function(data) {
          console.log("Successfully added and saved material");
          return data;
        })
        .catch(function(err) {
          alert(err.data.error);
          console.log('Failed to save material');
          console.log(err);
        })
    },

    // Function that sends changed material fields to backend and returns the response data
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

    // Function that sends a course id to be deleted to backend, and returns the response data
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

    // Function that sends a course material id to be deleted to backend, returns response data
    delete_material: function(id) {
      return $http.delete('/delete_material/' + id)
        .then(function(data) {
          alert(data.data.message);
          console.log("Successfully deleted material");
          return data;
        })
        .catch(function(err) {
          alert(err.data.error);
          console.log("Failed to delete material");
          console.log(err);
        })
    },

    // Function that sends tag options to filty by, and returns response data
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

    // Function that sends an announcement to be added and returns the response data
    add_announcement: function(announcement) {

      return $http.post('/add_announcement/', announcement)
        .then(function(data) {
          alert(data.data.message);
          console.log("Successfully added announcement");
          return data;
        })
        .catch(function(err) {
          alert(data.data.error);
          console.log("Failed to add announcement");
          console.log(err);
        })
    }

  }

}]);
