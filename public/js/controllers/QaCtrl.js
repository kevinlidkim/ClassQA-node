angular.module('QaCtrl', []).controller('QaController', ['$scope', '$location', '$routeParams','moment', 'MainService', 'QaService', '$sce', function($scope, $location, $routeParams, moment, MainService, QaService, $sce) {

	$scope.material_id = "";
	$scope.material = {};
	$scope.questions = [];

	$scope.file_id = "";

	// Variable that lets view know a search was successful
	$scope.searched = false;
	// Value of the query that updates after successful search
	$scope.searched_for = "";
	$scope.searched_questions = "";
	// Indexes of the current most/least recent questions of the 10 displayed
	$scope.most_recent = 0;
	$scope.least_recent = 9;

	load_material = function(id) {

		// console.log('loading material with id: ' + id);

		return QaService.load_material(id)
			.then(function(data) {
				$scope.material_id = id;
				$scope.material = $sce.trustAsResourceUrl(data.fileURL);

				// console.log("opening material in a new window");
				// window.open($scope.material);

				// console.log("this is material_displaY: " + $scope.material);

			})
			.catch(function(err) {
				console.log(err);
			})

	}

	load_questions = function(id) {
		$scope.file_id = id;
		// console.log('loading questions in this material');
		return QaService.load_qa(id)
			.then(function(data) {
				$scope.questions = data.data.data;

				$scope.questions.forEach(function(question) {
					// Add an 'edit' property to each question, initialized as the question body
					question.edit = question.body;
					// Show the best answer for each question
					show_best_answer(question);
				})

				console.log($scope.questions);

			})
			.catch(function(err) {
				console.log(err);
			})
	}

	show_best_answer = function(question) {
		return QaService.show_best_answer(question._id)
			.then(function(data) {
				// If best answer for a question exists
				if (data.data.answer) {
					question.best_answer = data.data.answer;
					// Add an 'edit' property initialized as the answer body
					question.best_answer.edit = question.best_answer.answer;
				}
			})
			.catch(function(err) {

			})
	}

	$scope.ask_question = function() {
		var question = {
			body: $scope.ask_ques,
			material_id: $scope.material_id
		}

		$scope.ask_ques = "";

		return QaService.ask_question(question)
			.then(function(data) {
				load_questions($routeParams.id);
			})
			.catch(function(err) {
				console.log(err);
			})
	}

	$scope.answer_question = function(index) {
		// Get the question_id and answer text from the question at the index
		var question = $scope.questions[index];

		var answer = {
			question_id: question._id,
			// question.ans is the current answer being submitted, created from ng-model
			body: question.ans
		}
		// Empty the answer text field
		question.ans = "";

		console.log("Answer object:");
		console.log(answer);
		//somereason on backend mongo this doesnt fill out question field

		return QaService.answer_question(answer)
			.then(function(data) {
				$scope.show_answers(index);
			})
			.catch(function(err) {
			})
	}

	$scope.show_answers = function(index) {
		// Get the question_id from the question at the index
		var question = $scope.questions[index];

		return QaService.load_answers(question._id)
			.then(function(data) {
				question.answers = data.data.answers;

				// Add an 'edit' property to each answer, initialized as the answer body
				var answers = question.answers;
				answers.forEach(function(answer) {
					answer.edit = answer.answer;
				})
			})
			.catch(function(err) {

			})
	}

	$scope.edit_question = function(index) {
		var question = $scope.questions[index];

		var edit = {
			question_id: question._id,
			body: question.edit
		};

		return QaService.edit_question(edit)
			.then(function(data) {
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
				$scope.questions.splice(index, 1);
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
				// If the best answer was updated, update it
				if (index == -1) {
					show_best_answer(question);
				}
				else {
					// Get the updated upvotes, but is a call to backend necessary?
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

		return QaService.endorse_answer(answer_id)
			.then(function(data) {
				if (index == -1) {
					show_best_answer(question);
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
		var search = {
			id: $scope.material_id,
			query: $scope.search_query
		};

		return QaService.search_question(search)
			.then(function(data) {
				console.log(data.data.data);
				// Set the questions on the page to the found questions
				$scope.searched_questions = data.data.data;
				// Slice the array to get the 0th to 9th indexed questions
				$scope.questions = $scope.searched_questions.slice(0,10);
				$scope.most_recent = 0;
				$scope.least_recent = 9;
				// Update search variables
				$scope.searched = true;
				$scope.searched_for = $scope.search_query;
				// Set the values to oldest and newest questions found
				$scope.newest = $scope.questions[0]._id;
				$scop.oldest = $scope.questions[$scope.questions.length -1]._id;
			})
			.catch(function(err) {

			})
	}

	$scope.search_prev = function() {
		// Decrement the indexes of the most/least recent question
		$scope.most_recent = $scope.most_recent - 10;
		$scope.least_recent = $scope.least_recent - 10;
		// Reset the indexes if it goes under the number of questions
		if ($scope.most_recent < 0) {
			$scope.most_recent = 0;
		}
		if ($scope.least_recent <= 0) {
			$scope.least_recent = 9;
		}
		$scope.questions = $scope.searched_questions.slice($scope.most_recent, $scope.least_recent + 1);
	}

	$scope.search_next = function() {
		// Increment the indexes of the most/least recent questions
		$scope.most_recent = $scope.most_recent + 10;
		$scope.least_recent = $scope.least_recent + 10;
		// Reset the indexes if it goes past the number of questions
		if ($scope.most_recent >= $scope.searched_questions.length) {
			$scope.most_recent = $scope.most_recent - 10;
		}
		if ($scope.least_recent >= $scope.searched_questions.length) {
			$scope.least_recent = $scope.searched_questions.length -1;
		}
		$scope.questions = $scope.searched_questions.slice($scope.most_recent, $scope.least_recent + 1);
	}

	load_material($routeParams.id);
	load_questions($routeParams.id);

}])
