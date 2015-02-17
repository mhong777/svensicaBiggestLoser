'use strict';

angular.module('users').controller('WeightindexController', ['$scope', '$stateParams', '$location', 'socket', 'Authentication', '$http',
	function($scope, $stateParams, $location, socket, Authentication, $http) {        
        
        /*********
        FUNCTIONS TO GET DATA
        *********/
        $scope.init=function(){
            
            if(!Authentication.user){
                $location.path('/');
            }            
            else{
                var req={};
                req.name=Authentication.user.displayName;
                $http.get('/gvars').
                    success(function(data, status){
                        $scope.weekNum=data[0].week;
                        //get the user data
                        //need to change these for when gvars get return the actual week number
                        $scope.weeksFinished=$scope.weekNum-1;      
                        $scope.inputError=true;
                        if($scope.weekNum===1){
                            $scope.weekCheck=true;    
                        }
                        else{
                            $scope.weekCheck=false;    
                        }
                    }).then(function(){
                    
                        console.log('logged');
                        $http.post('/getByName',req).
                            success(function(data, status){
                                $scope.userData = data;
            //                    console.log($scope.userData);
                                //make sure they set the initial weight
                                if(!$scope.userData.startingWeight){
                                    $location.path('/set-weight');    
                                }
                                else{
                                    //have to spell this out for ng-repeat
                                    $scope.weightHistory=$scope.userData.weightHistory;

                                    //set the placeholder
                                    if($scope.userData.weightHistory[$scope.weekNum-1]){
                                        $scope.weightInput=$scope.userData.weightHistory[$scope.weekNum-1];
                                    }
                                    else{
                                        $scope.weightInput=$scope.userData.weightHistory[$scope.userData.weightHistory.length-1];
                                    }

                                    $scope.setMsgs();                                    
                                }
                            });                    
                });



                $http.post('/getMyStats',req).
                    success(function(data, status){
                        $scope.myStats=data;
                    });

                socket.emit('getGraphData', req);                
            }
            
        };
        
        $scope.init();
        
        socket.on('newWeek', function(data){
            $scope.weekNum=data.week;
            if($scope.weekNum===1){
                $scope.weekCheck=true;    
            }
            else{
                $scope.weekCheck=false;    
            }            
            $scope.$digest();
        })
        
        socket.on('sendUserGraph', function (data) {
            $scope.graphData=data.graphData;
            $scope.userStats=data.userStats;            
            $scope.$digest();
        });
        
        
        /*********
        FUNCTIONS TO ADD WEIGHT
        *********/
        $scope.addWeight=function(){
            if($scope.weightInput<=70){
                $scope.inputError='I don\'t think that\'s possible';
                $scope.inputError=false;
            }
            else{
                $scope.inputError=true;
                $scope.input={};
                $scope.input.weightInput=$scope.weightInput;
                $scope.input.week=$scope.weekNum;
                $scope.input.userId=$scope.userData._id;
                $scope.input.name=Authentication.user.displayName;
                
                var req={};
                req.name=Authentication.user.displayName;                            
                
                $http.post('/addWeight',$scope.input).
                    success(function(data, status){
                        $http.post('/getMyStats',req).
                            success(function(data, status){
                                $scope.myStats=data;
                            
                                var req={};
                                req.name=Authentication.user.displayName;            
                                $http.post('/getByName',req).
                                    success(function(data, status){
                                        $scope.userData = data;
                                        $scope.setMsgs();
                                    });                                                        
                            });

                        socket.emit('getGraphData', req);                    
                    });
                
                
                
//                socket.emit('addWeight', $scope.input);                
            }            
        };
        
        /*********
        SUPPORT FUNCTIONS
        *********/
        $scope.setMsgs=function(){
            //set the msg - first is week num, the amount to next milestone then amount to target
            console.log('week num ' + $scope.weekNum);
            if($scope.weekNum % 4){
                $scope.weekDiff=4-($scope.weekNum % 4);
                if($scope.weekDiff>1){
                    $scope.msg1=$scope.weekDiff + ' weeks to go until your next milestone';
                }
                else{
                    $scope.msg1=$scope.weekDiff + ' weeks to go until your next milestone';
                }
            }
            else{
                $scope.msg1='It\'s milestone week. Time to PUSH';
            }
            //milestone            
            $scope.milestoneNum=($scope.weekNum/4).toFixed(0);
            console.log('milestone ' + ($scope.weekNum/4).toFixed(0) + ' ' + $scope.milestoneNum);
            if($scope.milestoneNum==0){
                console.log('0 milestone');
                $scope.msg2= 'You have ' + ($scope.userData.weightHistory[$scope.userData.weightHistory.length-1]-$scope.userData.milestones[$scope.milestoneNum]).toFixed(2) + ' lbs to go to get to it!';
            }
            else if($scope.userData.milestones[$scope.milestoneNum-1]<$scope.userData.weightHistory[$scope.userData.weightHistory.length-1]){
                $scope.msg2= 'You have ' + ($scope.userData.weightHistory[$scope.userData.weightHistory.length-1]-$scope.userData.milestones[$scope.milestoneNum-1]).toFixed(2) + ' lbs to go to get to it!';
            }
            else{
                $scope.msg2='Congrats you\'ve reached your next milestone. But don\'t slack off!';
            }

            //total
            if($scope.userData.targetWeight<$scope.userData.weightHistory[$scope.userData.weightHistory.length-1]){
//                console.log('other true');
                $scope.msg3=($scope.userData.weightHistory[$scope.userData.weightHistory.length-1]-$scope.userData.targetWeight).toFixed(2) + ' lbs to go to your overall target';
            }
            else{
                $scope.msg3='Congrats you\'ve reached your goal =) Now keep it off';
            }                        
        };
        
        
        
	}
]);