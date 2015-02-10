'use strict';

(function() {
	// Workouts Controller Spec
	describe('Workouts Controller Tests', function() {
		// Initialize global variables
		var WorkoutsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Workouts controller.
			WorkoutsController = $controller('WorkoutsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Workout object fetched from XHR', inject(function(Workouts) {
			// Create sample Workout using the Workouts service
			var sampleWorkout = new Workouts({
				name: 'New Workout'
			});

			// Create a sample Workouts array that includes the new Workout
			var sampleWorkouts = [sampleWorkout];

			// Set GET response
			$httpBackend.expectGET('workouts').respond(sampleWorkouts);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.workouts).toEqualData(sampleWorkouts);
		}));

		it('$scope.findOne() should create an array with one Workout object fetched from XHR using a workoutId URL parameter', inject(function(Workouts) {
			// Define a sample Workout object
			var sampleWorkout = new Workouts({
				name: 'New Workout'
			});

			// Set the URL parameter
			$stateParams.workoutId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/workouts\/([0-9a-fA-F]{24})$/).respond(sampleWorkout);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.workout).toEqualData(sampleWorkout);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Workouts) {
			// Create a sample Workout object
			var sampleWorkoutPostData = new Workouts({
				name: 'New Workout'
			});

			// Create a sample Workout response
			var sampleWorkoutResponse = new Workouts({
				_id: '525cf20451979dea2c000001',
				name: 'New Workout'
			});

			// Fixture mock form input values
			scope.name = 'New Workout';

			// Set POST response
			$httpBackend.expectPOST('workouts', sampleWorkoutPostData).respond(sampleWorkoutResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Workout was created
			expect($location.path()).toBe('/workouts/' + sampleWorkoutResponse._id);
		}));

		it('$scope.update() should update a valid Workout', inject(function(Workouts) {
			// Define a sample Workout put data
			var sampleWorkoutPutData = new Workouts({
				_id: '525cf20451979dea2c000001',
				name: 'New Workout'
			});

			// Mock Workout in scope
			scope.workout = sampleWorkoutPutData;

			// Set PUT response
			$httpBackend.expectPUT(/workouts\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/workouts/' + sampleWorkoutPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid workoutId and remove the Workout from the scope', inject(function(Workouts) {
			// Create new Workout object
			var sampleWorkout = new Workouts({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Workouts array and include the Workout
			scope.workouts = [sampleWorkout];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/workouts\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleWorkout);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.workouts.length).toBe(0);
		}));
	});
}());