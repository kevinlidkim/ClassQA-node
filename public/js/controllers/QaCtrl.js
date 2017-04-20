angular.module('QaCtrl', []).controller('QaController', ['$scope', '$location', '$routeParams','moment', 'MainService', 'QaService', function($scope, $location, $routeParams, moment, MainService, QaService) {

	$scope.material_id = "";
	$scope.material = {};

	load_material = function(id) {

		console.log('loading material with id: ' + id);

		return QaService.load_material(id)
			.then(function(data) {
				console.log('cool');
				$scope.material_id = id;
				$scope.material = data.data;
			})
			.catch(function(err) {
				console.log('not cool');
				console.log(err);
			})

	}

	load_material($routeParams.id);

}]);
