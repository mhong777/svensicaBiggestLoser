'use strict';

angular.module('participants').controller('HomepgController', ['$scope', '$location', 'Authentication',
	function($scope, $location, Authentication) {
        if(Authentication.user){
            $location.path('/home');
        }
        
	}
]);