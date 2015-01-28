'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('users').factory('socket', function(){
    var socket=io.connect('/');
//    var socket=io.connect('http://localhost:3000');
    return socket;
});
