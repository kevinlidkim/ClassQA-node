angular.module('QaServ', []).factory('QaService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  return {
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

    load_materials: function() {
      return $http.get('/load_materials')
        .then(function(data) {
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

    delete_question: function(id) {
      return $http.delete('/delete_question/' + id)
        .then(function(data) {
          console.log("Successfully deleted question");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to delete question");
          throw err;
        })
    },

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

    report_question: function(id) {
      return $http.post('/report_question/' + id)
        .then(function(data) {
          console.log(data);
          console.log("Successfully reported question");
          return data;
        })
        .catch(function(err) {
          console.log(err);
          console.log("Failed to report question");
          throw err;
        })
    },

    report_answer: function(id) {
      return $http.post('/report_answer/' + id)
        .then(function(data) {
          console.log("Successfully reported answer");
          return data;
        })
        .catch(function(err) {
          console.log("Failed to report error");
          throw err;
        })
    }

  }

}]);
