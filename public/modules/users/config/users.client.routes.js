'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
//		state('weightindex', {
//			url: '/weightindex',
//			templateUrl: 'modules/users/views/weightindex.client.view.html'
//		}).
		state('set-weight', {
			url: '/set-weight',
			templateUrl: 'modules/users/views/set-weight.client.view.html'
		}).
		state('weight-index', {
			url: '/home',
			templateUrl: 'modules/users/views/weightindex.client.view.html'
		}).
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/signin.client.view.html'
		});
	}
]);