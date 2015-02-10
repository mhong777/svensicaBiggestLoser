'use strict';

// Configuring the Articles module
angular.module('workouts').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Workouts', 'workouts', 'dropdown', '/workouts(/create)?');
		Menus.addSubMenuItem('topbar', 'workouts', 'List Workouts', 'workouts');
		Menus.addSubMenuItem('topbar', 'workouts', 'New Workout', 'workouts/create');
	}
]);