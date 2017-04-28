angular.module('QaServ', []).factory('QaService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  //private scope

  return {
  	//public scope
  	load_material: function(id) {
  		return $http.get('/load_material/' + id)
  			.then(function(data) {
  				console.log("Successfully loaded material");
          console.log(data);
          return data;
  			})
  			.catch(function(err) {
  				console.log(err);
  			})
  	},

  	load_qa: function(id) {
  		return $http.get('/load_qa/' + id)
  			.then(function(data) {
  				console.log("Successfully loaded questions");
  				return data;
  			})
  			.catch(function(err) {
  				console.log(err);
  			})
  	},

  	ask_question: function(question) {
  		return $http.post('/ask_question', question)
  			.then(function(data) {
  				console.log("Successfully asked question");
  				console.log(data);
  			})
  			.catch(function(err) {
  				console.log(err);
  			})
  	},
    
    answer_question: function(answer) {
    	return $http.post('/answer_question', answer)
    		.then(function(data) {
    			console.log("Successfully answered question");
    			console.log(data);
    		})
    		.catch(function(err) {
    			console.log("Failed to answer question");
    			console.log(err);
    		})
    },

    load_answers: function(id) {
    	return $http.get('/load_answers/' + id)
    		.then(function(data) {
    			console.log("Successfully loaded answers");
    			return data;
    		})
    		.catch(function(err) {
    			console.log("Failed to load answers");
    			consol.log(err);
    		})
    }

  }

}]);
