'use strict';

angular.module('users').controller('weightController', ['$scope', '$stateParams', '$location', 'socket', 'Authentication',
	function($scope, $stateParams, $location, socket, Authentication) {
        
        $scope.authentication = Authentication;
        $scope.setWeight=function(){
            if(!$scope.input || !$scope.input.currWeight || !$scope.input.tarWeight){
                console.log('input something');
            }
            else if($scope.input.currWeight<=$scope.input.tarWeight){
                console.log('not a real target');
            }
            else{
                
                $scope.input.userId=Authentication.user.displayName;
                console.log($scope.input);
                socket.emit('setInitialWeight', $scope.input);
                
				//And redirect to the index page
				$location.path('/');                
            }
        };
        socket.on('test back', function (data) {
            console.log(data);
        });
        
}]);