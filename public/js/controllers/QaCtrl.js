angular.module('QaCtrl', []).controller('QaController', ['$scope', '$location', '$routeParams','moment', 'MainService', 'UserService', 'QaService', '$sce', function($scope, $location, $routeParams, moment, MainService, UserService, QaService, $sce) {

	// Array of all materials in the course, used to see if user is allowed access
	$scope.materials = [];
	// ID of Material selected/being displayed
	$scope.material_id = "";
	// Material selected/being displayed
	$scope.material = {};

	// Array of all questions
	$scope.all_questions = [];
	// Array of 10 questions visible to the user at a time
	$scope.questions = [];

	// Variable that lets view know a search was successful
	$scope.searched = false;
	// Value of the query that updates after successful search
	$scope.searched_for = "";

	// Indexes of the current oldest/newest questions of the 10 displayed
	$scope.newest_index = 0;
	$scope.oldest_index = 9;

	// String of the search query
	$scope.search_query = "";

	// variable to check if user is authorized to see this page
	var authorized = false;

	// Function to load material by id
	load_material = function(id) {

		// calls method in QA Service to load material
		return QaService.load_material(id)
			.then(function(data) {

				// save id of material loaded
				$scope.material_id = id;
				// link of material to be displayed
				$scope.material = $sce.trustAsResourceUrl(data.fileURL);

			})
			.catch(function(err) {
				console.log(err);
			})

	}

	// Function to load array of materials
	load_materials = function() {
		// calls method in QaService to load all materials in the course
		return QaService.load_materials()
			.then(function(data) {
				// save materials
				$scope.materials = data.data.materials;
			})
			.catch(function(err) {
				console.log(err);
			})
	}

	// Function to load array of questions
	// id passed in is id of material
	load_questions = function(id) {
		// calls method in QaService to load questions
		return QaService.load_qa(id)
			.then(function(data) {
				// Assign the data to the array of all questions
				$scope.all_questions = data.data.data;
				// If there are less than 10 questions, set the oldest_index properly
				if ($scope.all_questions.length < 10) {
					$scope.oldest_index = $scope.all_questions.length - 1;
				}
				// Slice the array by the 10 or less questions currently viewing
				$scope.questions = $scope.all_questions.slice($scope.newest_index, $scope.oldest_index + 1);

				$scope.questions.forEach(function(question) {
					// Add an 'edit' property to each question, initialized as the question body
					question.edit = question.body;
					// Show the best answer for each question
					$scope.show_best_answer(question);
				})
			})
			.catch(function(err) {
				console.log(err);
			})
	}

	// Function to show best answer
	// Returns the best answer based on question id
	$scope.show_best_answer = function(question) {
		// call method in QaService to show best answer
		return QaService.show_best_answer(question._id)
			.then(function(data) {
				// If best answer for a question exists
				if (data.data.answer) {
					// save best answer recieved
					question.best_answer = data.data.answer;
					// Add an 'edit' property initialized as the answer body
					question.best_answer.edit = question.best_answer.answer;
					// Check if current user upvoted this answer
					$scope.check_upvote_answer(question.best_answer);
				}
			})
			.catch(function(err) {
			})
	}

	// Function to ask question on the material
	$scope.ask_question = function() {
		// Create the question object
		var question = {
			body: $scope.ask_ques,
			material_id: $scope.material_id
		}

		// reset field values
		$scope.ask_ques = "";

		// calls method in qaservice to ask question
		return QaService.ask_question(question)
			.then(function(data) {
				// If the user is viewing the last page of questions and there is room to show more,
				// update to show the question that got pushed down by the new question
				if ($scope.oldest_index == $scope.all_questions.length - 1 && $scope.oldest_index % 10 != 9) {
					$scope.oldest_index++;s
				}
				// re load questions on this material
				load_questions($routeParams.id);
				// Set searched to false to remove search result info
				$scope.searched = false;
			})
			.catch(function(err) {
				console.log(err);
			})
	}

	// Function to answer question on material
	// index is the index of question in the array
	$scope.answer_question = function(index) {
		// Get the question_id and answer text from the question at the index
		var question = $scope.questions[index];

		// create the answer object
		var answer = {
			question_id: question._id,
			// question.ans is the current answer being submitted, created from ng-model
			body: question.ans
		}
		// Empty the answer text field
		question.ans = "";

		// calls method in QaService to answer question
		return QaService.answer_question(answer)
			.then(function(data) {
				// refresh the answers for this question.
				$scope.show_answers(index);
			})
			.catch(function(err) {
			})
	}

	// Function to show answers on material
	$scope.show_answers = function(index) {
		// Get the question_id from the question at the index
		var question = $scope.questions[index];

		// call method in QaService to load answers by question id
		return QaService.load_answers(question._id)
			.then(function(data) {

				// save the answers data retrieved
				question.answers = data.data.answers;

				// Add an 'edit' property to each answer, initialized as the answer body
				var answers = question.answers;
				answers.forEach(function(answer) {
					answer.edit = answer.answer;
					// check each answer to see if current user already upvoted
					$scope.check_upvote_answer(answer);
				})
			})
			.catch(function(err) {

			})
	}

	// Function for student to edit own questions
	// Or used by professor to edit any questions
	$scope.edit_question = function(index) {
		// grab the question from index
		var question = $scope.questions[index];

		// create the edit object
		var edit = {
			question_id: question._id,
			body: question.edit
		};

		// calls method in QaService to edit question
		return QaService.edit_question(edit)
			.then(function(data) {
				// update the ng-model to reflect change.
				question.body = question.edit;
			})
			.catch(function(err) {

			})
	}

	$scope.edit_answer = function(index, question_index) {
		var question = $scope.questions[question_index];
		var answer;
		if (index == -1) {
			answer = question.best_answer;
		}
		else {
		  answer = question.answers[index];
		}


		var edit = {
			question_id: question._id,
			answer_id: answer._id,
			body: answer.edit
		};

		return QaService.edit_answer(edit)
			.then(function(data) {
				answer.answer = answer.edit;
			})
			.catch(function(err) {
			})
	}

	$scope.remove_question = function(index) {
		var question = $scope.questions[index];

		return QaService.delete_question(question._id)
			.then(function(data) {
				// Remove the question from the array of all questions
				$scope.all_questions.splice(index + $scope.newest_index, 1);
				// If the user removed from the last page of questions and there is
				// no more questions, show the previous 10 questions as the new last page
				if ($scope.all_questions.length % 10 == 0) {
					$scope.prev();
				} else { // Otherwise update the current view of questions normally
					$scope.questions = $scope.all_questions.slice($scope.newest_index, $scope.oldest_index + 1);
				}
			})
			.catch(function(err) {

			})

	}

	$scope.remove_answer = function(index, question_index) {
		var question = $scope.questions[question_index];
		var answer;
		if (index == -1) {
			answer = question.best_answer;
		}
		else {
		  answer = question.answers[index];
		}

		return QaService.delete_answer(answer._id)
			.then(function(data) {
				if (index == -1) {
					question.best_answer = null;
				}
				else {
					question.answers.splice(index, 1);
				}
			})
			.catch(function(err) {

			})

	}

	$scope.upvote_answer = function(index, question_index) {
		var question = $scope.questions[question_index];
		var answer;
		if (index == -1) {
			answer = question.best_answer;
		}
		else {
		  answer = question.answers[index];
		}

		var answer_id = {
			answer_id: answer._id
		};

		return QaService.upvote_answer(answer_id)
			.then(function(data) {

				if (answer.isUpvoted) {
					answer.upvotes--;
					answer.isUpvoted = false;
				} else {
					answer.upvotes++;
					answer.isUpvoted = true;
				}

			})
			.catch(function(err) {

			})
	}

	$scope.endorse_answer = function(index, question_index) {
		var question = $scope.questions[question_index];
		var answer;
		if (index == -1) {
			answer = question.best_answer;
		}
		else {
		  answer = question.answers[index];
		}

		var answer_id = {
			answer_id: answer._id
		};

		if(answer.endorse) {
			answer.endorse = null;
		}

		return QaService.endorse_answer(answer_id)
			.then(function(data) {
				if (index == -1) {
					$scope.show_best_answer(question);
				}
				else {
					// Get the updated endorsments, but is a call to backend necessary?
					return QaService.load_answers(question._id)
					.then(function(data) {
						question.answers = data.data.answers;
					})
					.catch(function(err) {

					})
				}
			})
			.catch(function(err) {

			})
	}

	$scope.search = function() {
		// If search was empty, just reload the original questions
		if ($scope.search_query == "") {
			load_questions($routeParams.id);
			$scope.searched = false;
			$scope.search_query = "";
		} else { // Otherwise continue the search
			var search = {
				id: $scope.material_id,
				query: $scope.search_query
			};

			return QaService.search_question(search)
				.then(function(data) {
					// Set the questions on the page to the found questions
					$scope.all_questions = data.data.data;
					// Reset the indexes
					$scope.newest_index = 0;
					$scope.oldest_index = 9;
					// If there are less than 10 questions and not 0, set the oldest_index properly
					if ($scope.all_questions.length < 10 && $scope.all_questions.length != 0) {
						$scope.oldest_index = $scope.all_questions.length - 1;
					}
					// Show the ten questions in the index range
					$scope.questions = $scope.all_questions.slice($scope.newest_index, $scope.oldest_index + 1);

					// Update search variables
					$scope.searched = true;
					$scope.searched_for = $scope.search_query;
					// Empty the search query
					$scope.search_query = "";
				})
				.catch(function(err) {

				})
			}
	}

	$scope.prev = function() {
		// Decrement the indexes of the newest question
		$scope.newest_index = $scope.newest_index - 10;
		//Index of the oldex question should always be 9 more than newest_index to display 10 questions
		$scope.oldest_index = $scope.newest_index + 9;
		// Reset the indexes if it goes under 0
		if ($scope.newest_index < 0) {
			$scope.newest_index = 0;
		}
		if ($scope.oldest_index <= 0) {
			$scope.oldest_index = 9;
		}
		// Show the ten questions within the index range
		$scope.questions = $scope.all_questions.slice($scope.newest_index, $scope.oldest_index + 1);
		// Show the best answer for each question
		$scope.questions.forEach(function(question) {
			$scope.show_best_answer(question);
		})
	}

	$scope.next = function() {
		// Increment the indexes of the most/least recent questions
		$scope.newest_index = $scope.newest_index + 10;
		//Index of the oldex question should always be 9 more than newest_index to display 10 questions
		$scope.oldest_index = $scope.newest_index + 9;
		// Reset the indexes if passes the total number of questions
		if ($scope.newest_index >= $scope.all_questions.length) {
			$scope.newest_index = $scope.newest_index - 10;
		}
		if ($scope.oldest_index >= $scope.all_questions.length) {
			$scope.oldest_index = $scope.all_questions.length - 1;
		}
		// Show the ten questions within the index range
		$scope.questions = $scope.all_questions.slice($scope.newest_index, $scope.oldest_index + 1);
		// Show the best answer for each question
		$scope.questions.forEach(function(question) {
			$scope.show_best_answer(question);
		})
	}

	$scope.report_question = function(index) {
		var question = $scope.questions[index];

		return QaService.report_question(question._id)
			.then(function(data) {

			})
			.catch(function(err) {

			})
	}

	$scope.report_answer = function(index, question_index) {
		var question = $scope.questions[question_index];
		var answer;
		if (index == -1) {
			answer = question.best_answer;
		}
		else {
		  answer = question.answers[index];
		}

		return QaService.report_answer(answer._id)
			.then(function(data) {

			})
			.catch(function(err) {

			})

	}

	$scope.check_upvote_answer = function(answer) {

		var answer_id = {
			answer_id: answer._id
		};

		return QaService.check_upvote_answer(answer_id)
			.then(function(data) {

				answer.isUpvoted = data.data.found;
				// console.log(answer);
				// return
			})
			.catch(function(err) {
				console.log(err);
			})

	}

	// Check if current user is the one who endorsed
	$scope.check_endorsed = function(answer) {
		var currUser = UserService.get_user();
		var endorsedBy = answer.endorse;

		return currUser == endorsedBy;
	}

	// ON LOAD, VALIDATE WHETHER THE USER HAS ACCESS TO THE COURSE MATERIAL
  load_materials()
    .then(function() {
      // Check to see if the material is within this course
      for (var i = 0; i < $scope.materials.length; i++) {
        if($scope.materials[i]._id == $routeParams.id) {
          authorized = true;
        }
      }
      // Load the material and questions if authorized, redirect otherwise
      if (authorized) {
        load_material($routeParams.id);
				load_questions($routeParams.id);
      } else {
        $location.path('/home');
      }
    })

	}])
