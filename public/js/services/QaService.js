angular.module('QaServ', []).factory('QaService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  return {
    // Function to load the material by its id, get its file, and return response data
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

    // Function to load all course material in the session's course value, and returns response data
    load_materials: function() {
      return $http.get('/load_materials')
        .then(function(data) {
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })
    },

    // Function to load all questions in a given course id, returns the response data
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

    // Function that sends a question to backend to be stored in the database
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

    // Function to answer a question by sending it to backend
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

    // Function to load all answers of a given question's id
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

    // Function to edit a question with its new value, returns response data
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

    // Function to edit an answer with its new value, returns response data
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

    // Function to delete a question by its id, returns response data
    delete_question: function(id) {
      return $http.delete('/delete_question/' + id)
        .then(function(data) {
          console.log("Successfully deleted question");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to delete question");
          console.log(err);
          throw err;
        })
    },

    // Function to delete an answer by its id, returns response data
    delete_answer: function(id) {
      return $http.delete('/delete_answer/' + id)
        .then(function(data) {
          console.log("Successfully deleted answer");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to delete answer");
          throw err;
        })
    },

    // Function to upvote an answer by its id, returns response data
    upvote_answer: function(id) {
      return $http.post('/upvote_answer', id)
        .then(function(data) {
          console.log("Successfully voted answer");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to vote answer");
          throw err;
        })
    },

    // Function to endorse an answer by its id, returns response data
    endorse_answer: function(id) {
      return $http.post('/endorse_answer', id)
        .then(function(data) {
          console.log("Successfully endorsed answer as professor");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to endorse answer");
          console.log(err);
          throw err;
        })
    },

    // Function to show the best answer of a question by its id, returns response data
    show_best_answer: function(id) {
      return $http.get('/show_best_answer/' + id)
        .then(function(data) {
          // console.log("Succesfully got best answer");
          // console.log(data);
          return data;
        })
        .catch(function(err) {
          // console.log("Failed to get best answer");
          throw err;
        })
    },

    // Function to search a question by its id and a query, returns response data
    search_question: function(search) {
      return $http.post('/search_question/' + search.id, search)
        .then(function(data) {
          console.log("Successfully searched for questions");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to search for questions");
          throw err;
        })
    },

    // Function to report a question by its id, returns response data
    report_question: function(id) {
      return $http.post('/report_question/' + id)
        .then(function(data) {
          alert(data.data.status);
          return data;
        })
        .catch(function(err) {
          alert(err.data.error);
          throw err;
        })
    },

    // Function to report an answer by its data, returns response data
    report_answer: function(id) {
      return $http.post('/report_answer/' + id)
        .then(function(data) {
          alert(data.data.status);
          return data;
        })
        .catch(function(err) {
          alert(data.data.error);
          throw err;
        })
    },

    // Function that checks if an answer has been upvoted or not, returns response data
    check_upvote_answer: function(id) {
      return $http.post('/check_upvote_answer', id)
        .then(function(data) {
          console.log("Successfully voted answer");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to vote answer");
          throw err;
        })
    }


  }

}]);
