module.exports = function (io) {
    'use strict';
var mongoose = require('mongoose'),
	User = mongoose.model('User'),   
    Participant = mongoose.model('Participant'),
    Gvar = mongoose.model('Gvar'),
	_ = require('lodash');
    
var totalWeeks=16,
    today,
    gvar,
    startDate = new Date(2015, 1, 9),
    ONE_WEEK = 1000 * 60 * 60 * 24 * 7,
    ONE_HOUR = 1000 * 60 * 60,
    difference,
    currentWeek;
    console.log(startDate + 'startDate');
    startDate=startDate.getTime();
    
/*****
TIMER FUNCTION
    need to just combine the if date 
    db.gvars.insert({name: 'vars', week:1})
    
    db.gvars.remove({})
    
    db.dropDatabase()
*****/
//    var sampleDate=new Date("July 21, 1983 04:15:00");
//    console.log(sampleDate.getHours());
    
var intervalId = setInterval(function() {
    today = new Date(); // Create a Date object to find out what time it is
    console.log(today.getHours());
    if(today.getHours() === 4){ // Check the time and iterate at 4am - need to ping every hour
        Gvar.find().exec(function(err, gvars) {
            if (err) {
                console.log(err);
            } else {
                gvar=gvars[0];
                
                //check what week it is
                today=today.getTime();
                
//                difference=Math.floor(Math.abs(today-startDate)/ONE_WEEK) + 1;
//                console.log(difference);
                
                
                //case if challenge hasn't started
                if(startDate>today){
                    gvar.week=1;
                }
                else{
                    //calculate week
                    difference=Math.floor(Math.abs(today-startDate)/ONE_WEEK)+1;
                    gvar.week=difference;
                }
                
                if(difference===16){
                    clearInterval(intervalId);
                }
                else{
                    gvar.save(function(err){
                        if(err){
                            console.log(err);
                        }
                    });
                    console.log(gvar);
                    socket.broadcast.emit('newWeek', gvar);                    
                }
            }
        });    
    }    
}, ONE_HOUR);  //pings every hour
//600000    

    
//        Gvar.find().exec(function(err, gvars) {
//            if (err) {
//                console.log(err);
//            } else {
//                gvar=gvars[0];
//                today = new Date();
//                //check what week it is
//                console.log(today + ' before transform\n');
//                today=today.getTime();
//                var testDate = new Date(2015, 2, 15);
//                testDate=testDate.getTime();
//                
//                    //calculate week
//                    difference=Math.floor(Math.abs(today-startDate)/ONE_WEEK);                    
//                    console.log(ONE_WEEK + ' week len');
//                    console.log(today + ' today');
//                    console.log(testDate + ' test date');
//                    console.log(startDate + ' start date');
//                    
//                    console.log(Math.abs(today-startDate));
//                    console.log('week ' + difference);
////                    gvar.week=difference+1;
//            }
//        });  
//    
    
    
    
    io.on('connection', function(socket){
        
        
        socket.broadcast.emit('user connected');
        
        socket.on('test msg', function(input){
            console.log(input);
            io.emit('test back', input);
        });    
        
        /*****
        SELECT A PLAYER AND SET THE INITIAL WEIGHT
        *****/
        socket.on('setInitialWeight', function(input){
            //get selected owner
            Participant.find({name:input.userId}).exec(function(err, participants) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('before\n' + participants[0]);
                        var parti=participants[0];
                    
                    parti.startingWeight=input.currWeight;
                    parti.targetWeight=input.tarWeight;
                    
                    parti.weightHistory=[];
                    parti.graphNumbers=[];
                    parti.milestones=[];
                    
                    parti.weightHistory.push(parti.startingWeight);
                    parti.graphNumbers.push(1);
                    
                    var difference = (parti.startingWeight-parti.targetWeight)/4;
                    difference = difference.toFixed(2);
                    
                    for(var x=1;x<5;x++){
                        parti.milestones.push(parti.startingWeight-difference*x);
                    }                                        
                    
                    parti.save();
                    console.log('after\n' + parti);                    
//                    io.emit('playerChosen', output);                                                          
                }
            });                          
        });
        
        /****
        GET DATA AND CREATE DATA STRUCTURE FOR GRAPH
        ****/        
//        socket.on('getUserData', function(input){
//            customGetFxn(input);
//        });        
        

        socket.on('getGraphData', function(){
            Participant.find({},{name:1, graphNumbers:1, points:1, _id:0}).exec(function(err, participants){
               if(err){
                   console.log(err);
               } 
                else{
                    var newUserData={},
                        newArray=[],
                        newValue=[],
                        myUser,
                        allData=[],
                        x,
                        y,
                        newUser={},
                        userStats=[],
                        output={},
                        arr=[],
                        sorted,
                        ranks;
                    for(x=0; x<participants.length; x++){
                        //for graph
                        myUser=participants[x];
                        newUserData={};
                        newArray=[];
                        newUserData.key=myUser.name;                            
                        for(y=0; y<myUser.graphNumbers.length; y++){
                            newValue=[];
//                            newValue=[y+1,parseFloat(((1-myUser.graphNumbers[y])*100).toFixed(2))];
                            newValue=[y+1,myUser.graphNumbers[y]];
                            newArray.push(newValue);
                        }
                        newUserData.values=newArray;
                        allData.push(newUserData);

                        //for table
                        newUser={};
                        newUser.name=myUser.name;
                        newUser.points=myUser.points;
                        arr.push(myUser.points);
                        newUser.progress=myUser.graphNumbers[myUser.graphNumbers.length-1];
//                            ((1-myUser.graphNumbers[myUser.graphNumbers.length-1])*100).toFixed(2);
                        userStats.push(newUser);
                    }


                    //do the ranks
                    sorted = arr.slice().sort(function(a,b){return b-a});
                    ranks = arr.slice().map(function(v){ return sorted.indexOf(v)+1 });
                    for(x=0; x<userStats.length; x++){
                        userStats[x].rank=ranks[x];
                    }

                    //benchmark values
                    newUserData={};
                    newArray=[];
                    newUserData.key='Goal';                        
                    for(var x=0; x<totalWeeks; x++){
                        newValue=[];
                        newValue=[x+1,100];
                        newArray.push(newValue);
                    }
                    newUserData.values=newArray;
                    allData.push(newUserData);

                    output.graphData=allData;
                    output.userStats=userStats;
                    io.emit('sendUserGraph', output);
                }
            });  
        });        
                
        
        
        /****
        ADD WEIGHT TO A USER
            NEED TO ADD TO WEIGHT HISTORY AND GRAPH NUMBERS
            SEND BACK UPDATED USER DATA
            HAVE THE CLIENT UPDATE THE GRAPH DATA AND DIGEST
        ****/
        socket.on('addWeight', function(input){
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    currentWeek=gvars[0].week;
                    
                    
                    //calculate points and add to user
                    Participant.findById(input.userId).exec(function(err, parti) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('week ' + currentWeek);
                            console.log(parti);
                            //######TODO
                            //need to add points - make sure you don't double tap
                            //need a way to track
                            //or only let ppl put in their weight once
                            if(currentWeek===5){
                                if(input.weightInput<=parti.milestones[0]){
                                    parti.pointArray.splice(0,1,5);
                                }
                                else{
                                    parti.pointArray.splice(0,1,0);
                                }                                
                            }
                            else if(currentWeek>5 && currentWeek<9){
                                //6 7 8
                                if(input.weightInput<=parti.milestones[0]){
                                    parti.pointArray.splice(currentWeek-5,1,0);
                                }
                                else{
                                    parti.pointArray.splice(currentWeek-5,1,-1);
                                }                                
                            }
                            else if(currentWeek===9){
                                if(input.weightInput<=parti.milestones[1]){
                                    parti.pointArray.splice(5,1,5);
                                }
                                else{
                                    parti.pointArray.splice(5,1,0);
                                }                                
                            }
                            else if(currentWeek>9 && currentWeek<13){
                                if(input.weightInput<=parti.milestones[1]){
                                    parti.pointArray.splice(currentWeek-9+5,1,0);
                                }
                                else{
                                    parti.pointArray.splice(currentWeek-9+5,1,-1);
                                }                                
                            }
                            else if(currentWeek===13){
                                if(input.weightInput<=parti.milestones[2]){
                                    parti.pointArray.splice(9,1,5);
                                }
                                else{
                                    parti.pointArray.splice(9,1,0);
                                }                                                                
                            }
                            else if(currentWeek>13 && currentWeek<17){
                                if(input.weightInput<=parti.milestones[2]){
                                    parti.pointArray.splice(currentWeek-13+9,1,0);
                                }
                                else{
                                    parti.pointArray.splice(currentWeek-13+9,1,-1);
                                }                                
                            }
                            else if(currentWeek===17){
                                if(input.weightInput<=parti.milestones[3]){
                                    parti.pointArray.splice(17,1,5);
                                }
                                else{
                                    parti.pointArray.splice(17,1,0);
                                }                                
                            }
                            parti.weightHistory.splice(input.week-1, 1,input.weightInput);
                            parti.graphNumbers.splice(input.week-1,1,parseFloat(input.weightInput/parti.startingWeight));
                            
                            var ptot=0;
                            for(var z=0; z<parti.pointArray.length; z++){
                                ptot+=parti.pointArray[z];
                            }
                            parti.points=ptot;
                            
                            parti.save(function(err) {
                                if (err) {
                                    console.log(err);
                                }
                                else{
                                    customGetFxn(input.name);        
                                }
                            });
                        }
                    });                       
                }
            });                
        });
        
        
        
        
        
        
        
        
        
        /***********************
        *******FUNCTIONS
        ***********************/
        function customGetFxn(input){
            //SEND OUT THE USER INFO
            Participant.find({name:input}).exec(function(err, participants) {
                if (err) {
                    console.log(err);
                } else {
                    var parti={},
                        myStats=[],
                        inputData={},
                        x,
                        userOutput={};
                    for(x=0; x<participants[0].weightHistory.length; x++){
                        inputData={};
                        inputData.weight=participants[0].weightHistory[x];
                        inputData.progress=((1-participants[0].graphNumbers[x])*100).toFixed(2);
                        myStats.push(inputData);
                    }
                    parti.user=participants[0];
                    parti.myStats=myStats;
//                    console.log(parti);
                    
                    io.emit('setUserData', parti);
                }
            }).then(function(){
                //MAKE THE GRAPH INFO
                Participant.find({},{name:1, graphNumbers:1, points:1, _id:0}).exec(function(err, participants){
                   if(err){
                       console.log(err);
                   } 
                    else{
                        var newUserData={},
                            newArray=[],
                            newValue=[],
                            myUser,
                            allData=[],
                            x,
                            y,
                            newUser={},
                            userStats=[],
                            output={},
                            arr=[],
                            sorted,
                            ranks;
                        for(x=0; x<participants.length; x++){
                            //for graph
                            myUser=participants[x];
                            newUserData={};
                            newArray=[];
                            newUserData.key=myUser.name;                            
                            for(y=0; y<myUser.graphNumbers.length; y++){
                                newValue=[];
                                newValue=[y+1,parseFloat(((1-myUser.graphNumbers[y])*100).toFixed(2))];
                                newArray.push(newValue);
                            }
                            newUserData.values=newArray;
                            allData.push(newUserData);
                            
                            //for table
                            newUser={};
                            newUser.name=myUser.name;
                            newUser.points=myUser.points;
                            arr.push(myUser.points);
                            newUser.progress=((1-myUser.graphNumbers[myUser.graphNumbers.length-1])*100).toFixed(2);
                            userStats.push(newUser);
                        }
                        
                        
                        //do the ranks
                        sorted = arr.slice().sort(function(a,b){return b-a});
                        ranks = arr.slice().map(function(v){ return sorted.indexOf(v)+1 });
                        for(x=0; x<userStats.length; x++){
                            userStats[x].rank=ranks[x];
                        }
                        
                        //benchmark values
                        newUserData={};
                        newArray=[];
                        newUserData.key='Goal';                        
                        for(var x=0; x<totalWeeks; x++){
                            newValue=[];
                            newValue=[x+1,100];
                            newArray.push(newValue);
                        }
                        newUserData.values=newArray;
                        allData.push(newUserData);
                        
                        output.graphData=allData;
                        output.userStats=userStats;
                        io.emit('sendUserGraph', output);
                    }
                });            
            });            
        };
    });
};