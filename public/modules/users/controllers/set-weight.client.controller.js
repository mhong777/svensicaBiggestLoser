'use strict';

angular.module('users').controller('weightController', ['$scope', '$stateParams', '$location', 'socket', 'Authentication', '$http',
	function($scope, $stateParams, $location, socket, Authentication, $http) {
        
        $scope.authentication = Authentication;
        
        $scope.init=function() {
            if(!Authentication.user){
                $location.path('/');
            }
            else{
                //grab user - if the starting weight is already set then re-direct
                var req={};
                req.name=Authentication.user.displayName;
                $http.post('/getByName',req).
                    success(function(data, status){
                        $scope.userData = data;
                        if($scope.userData.startingWeight>40){
                            $location.path('/home');
                        }                        
                    });                
            }
        };
        
        $scope.init();
        
        $scope.setWeight=function() {
            if(!$scope.input || !$scope.input.currWeight || !$scope.input.tarWeight){
                console.log('input something');
            }
            else if($scope.input.currWeight<=$scope.input.tarWeight){
                console.log('not a real target');
            }
            else{
                var req={};
                req.startingWeight=$scope.input.currWeight;
                req.targetWeight=$scope.input.tarWeight;
                req.name=Authentication.user.displayName;
                
                console.log(req);
                
                $http.post('/setInitialWeight',req).
                    success(function(data, status){
                        $location.path('/home');
                    });
                
                
//                // Redirect after save
//                $scope.userData.$save(function(response) {
//                    $location.path('/home');
//                }, function(errorResponse) {
//                    console.log(errorResponse.data.message);
//                });
            }
        };
        
                
                
//                $scope.input.userId=Authentication.user.displayName;
//                console.log($scope.input);
//                socket.emit('setInitialWeight', $scope.input);
//                
//				//And redirect to the index page
//				$location.path('/home');        
        
}]);