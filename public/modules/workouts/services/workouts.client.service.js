'use strict';

//Workouts service used to communicate Workouts REST endpoints
angular.module('workouts').factory('Workouts', ['$resource',
	function($resource) {
		return $resource('workouts/:workoutId', { workoutId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);