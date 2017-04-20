angular.module('QaServ', []).factory('QaService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  //private scope

  return {
  	//public scope
  	load_material: function(id) {
  		var url = /load_material/ + id;
  		return $http.get(url)
  			.then(function(data) {
  				console.log("Successfully loaded material");
          console.log(data);
          return data;
  			})
  			.catch(function(err) {
  				console.log(err);
  			})
  	}
    

  }

}]);
