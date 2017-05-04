angular.module('QaServ', []).factory('QaService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  //private scope

  return {

  	//public scope

  	load_material: function(id) {
  		var url = /load_material/ + id;
  		return $http.get(url, {responseType: 'arraybuffer'})
  			.then(function(data) {


  				// console.log("Successfully loaded material");
          // console.log(data);

          var file = new Blob([data.data], {type: 'application/pdf'});
          var fileURL = URL.createObjectURL(file);

          // console.log("fileURL is: " + fileURL);

          data.fileURL = fileURL;
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
    			console.log(err);
    		})
    },

    edit_question: function(edit) {
      return $http.post('/edit_question', edit)
        .then(function(data) {
          console.log("Successfully edited question");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to edit question");
          throw err;
        })
    },

    edit_answer: function(edit) {
      return $http.post('/edit_answer', edit)
        .then(function(data) {
          console.log("Successfully edited answer");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to edit answer");
          throw err;
        })
    },

    delete_answer: function(ans) {
      return $http.post('/delete_answer', ans)
        .then(function(data) {
          console.log("Successfully removed answer");
        })
        .catch(function(err) {
          console.log("Failed to remove Answer");
          throw err;
        })
    }

  }

}]);
