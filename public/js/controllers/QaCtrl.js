angular.module('QaCtrl', []).controller('QaController', ['$scope', '$location', '$routeParams','moment', 'MainService', 'QaService', '$sce', function($scope, $location, $routeParams, moment, MainService, QaService, $sce) {

	$scope.material_id = "";
	$scope.material = {};
	$scope.questions = [];

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
		// console.log('loading questions in this material');
		return QaService.load_qa(id)
			.then(function(data) {
				$scope.questions = data.data.data;

				// Add an 'edit' property to each question, initialized as the question body
				$scope.questions.forEach(function(question) {
					question.edit = question.body;
				})

				console.log($scope.questions);

			})
			.catch(function(err) {
				console.log(err);
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
		// Get the true index of the question in the array before being ordered by timestamp
		var true_index = $scope.questions.length - index - 1;
		// Get the question_id and answer text from the question at the true index
		var question = $scope.questions[true_index];

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
				$scope.show_answers(true_index);
			})
			.catch(function(err) {
			})
	}

	$scope.show_answers = function(index) {
		// Get the true index of the question in the array before being ordered by timestamp
		var true_index = $scope.questions.length - index - 1;
		// Get the question_id from the question at the true index
		var question = $scope.questions[true_index];

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
		// Get the true index of the question in the array before being ordered by timestamp
		var true_index = $scope.questions.length - index - 1;
		var question = $scope.questions[true_index];

		var edit = {
			question_id: question._id,
			body: question.edit
		}

		return QaService.edit_question(edit)
			.then(function(data) {
				question.body = question.edit;
			})
			.catch(function(err) {

			})
	}

	$scope.edit_answer = function(index, parent_index) {
		// Get the true index of the parent question in the array before being ordered by timestamp
		var true_question_index = $scope.questions.length - parent_index - 1;
		var question = $scope.questions[true_question_index];

		var answer = question.answers[index];

		var edit = {
			question_id: question._id,
			answer_id: answer._id,
			body: answer.edit
		}

		return QaService.edit_answer(edit)
			.then(function(data) {
				answer.answer = answer.edit;
			})
			.catch(function(err) {

			})
	}

	$scope.remove_question = function(index) {
		var true_index = $scope.questions.length - index - 1;
		var question = $scope.questions[true_index];

		var question_id = {
			question_id: question._id
		}

		return QaService.delete_question(question_id)
			.then(function(data) {
				$scope.questions.splice(true_index, 1);
			})
			.catch(function(err) {

			})

	}

	$scope.remove_answer = function(index, parent_index) {
		var true_question_index = $scope.questions.length - parent_index - 1;
		var question = $scope.questions[true_question_index];

		var answer = question.answers[index];

		var answer_id = {
			answer_id: answer._id
		}

		return QaService.delete_answer(answer_id)
			.then(function(data) {
				question.answers.splice(index, 1);
			})
			.catch(function(err) {

			})

	}

	load_material($routeParams.id);
	load_questions($routeParams.id);

}]);
