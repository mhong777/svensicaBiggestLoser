'use strict';

angular.module('users').directive('testdirective', [
	function() {
		return {
			template: '<div></div>',
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				// Testdirective directive logic
				// ...

				element.text('this is the testdirective directive');
			}
		};
	}
]);