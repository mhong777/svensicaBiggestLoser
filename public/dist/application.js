'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'svensicabiggestloser';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.utils',
        'nvd3ChartDirectives'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName) {
      // Create angular module
      angular.module(moduleName, []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('gvars');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('participants');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('recipes');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('workouts');'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/participants/views/homepg.client.view.html'
    });
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  function ($scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['user'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic || this.menus[menuId].isPublic,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic || this.menus[menuId].isPublic,
            roles: roles || this.defaultRoles,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
//Setting up route
angular.module('gvars').config([
  '$stateProvider',
  function ($stateProvider) {
    // Gvars state routing
    $stateProvider.state('listGvars', {
      url: '/gvars',
      templateUrl: 'modules/gvars/views/list-gvars.client.view.html'
    }).state('createGvar', {
      url: '/gvars/create',
      templateUrl: 'modules/gvars/views/create-gvar.client.view.html'
    }).state('viewGvar', {
      url: '/gvars/:gvarId',
      templateUrl: 'modules/gvars/views/view-gvar.client.view.html'
    }).state('editGvar', {
      url: '/gvars/:gvarId/edit',
      templateUrl: 'modules/gvars/views/edit-gvar.client.view.html'
    });
  }
]);'use strict';
// Gvars controller
angular.module('gvars').controller('GvarsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Gvars',
  function ($scope, $stateParams, $location, Authentication, Gvars) {
    $scope.authentication = Authentication;
    // Create new Gvar
    $scope.create = function () {
      // Create new Gvar object
      var gvar = new Gvars({ name: this.name });
      // Redirect after save
      gvar.$save(function (response) {
        $location.path('gvars/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing Gvar
    $scope.remove = function (gvar) {
      if (gvar) {
        gvar.$remove();
        for (var i in $scope.gvars) {
          if ($scope.gvars[i] === gvar) {
            $scope.gvars.splice(i, 1);
          }
        }
      } else {
        $scope.gvar.$remove(function () {
          $location.path('gvars');
        });
      }
    };
    // Update existing Gvar
    $scope.update = function () {
      var gvar = $scope.gvar;
      gvar.$update(function () {
        $location.path('gvars/' + gvar._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Gvars
    $scope.find = function () {
      $scope.gvars = Gvars.query();
    };
    // Find existing Gvar
    $scope.findOne = function () {
      $scope.gvar = Gvars.get({ gvarId: $stateParams.gvarId });
    };
  }
]);'use strict';
//Gvars service used to communicate Gvars REST endpoints
angular.module('gvars').factory('Gvars', [
  '$resource',
  function ($resource) {
    return $resource('gvars/:gvarId', { gvarId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
//Setting up route
angular.module('participants').config([
  '$stateProvider',
  function ($stateProvider) {
    // Participants state routing
    $stateProvider.state('rules', {
      url: '/rules',
      templateUrl: 'modules/participants/views/rules.client.view.html'
    }).state('homepg', {
      url: '/homepg',
      templateUrl: 'modules/participants/views/homepg.client.view.html'
    }).state('listParticipants', {
      url: '/participants',
      templateUrl: 'modules/participants/views/list-participants.client.view.html'
    }).state('createParticipant', {
      url: '/participants/create',
      templateUrl: 'modules/participants/views/create-participant.client.view.html'
    }).state('viewParticipant', {
      url: '/participants/:participantId',
      templateUrl: 'modules/participants/views/view-participant.client.view.html'
    }).state('editParticipant', {
      url: '/participants/:participantId/edit',
      templateUrl: 'modules/participants/views/edit-participant.client.view.html'
    });
  }
]);'use strict';
angular.module('participants').controller('HomepgController', [
  '$scope',
  '$location',
  'Authentication',
  function ($scope, $location, Authentication) {
    if (Authentication.user) {
      $location.path('/home');
    }
  }
]);'use strict';
// Participants controller
angular.module('participants').controller('ParticipantsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Participants',
  function ($scope, $stateParams, $location, Authentication, Participants) {
    $scope.authentication = Authentication;
    // Create new Participant
    $scope.create = function () {
      // Create new Participant object
      var participant = new Participants({ name: this.name });
      // Redirect after save
      participant.$save(function (response) {
        $location.path('participants/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing Participant
    $scope.remove = function (participant) {
      if (participant) {
        participant.$remove();
        for (var i in $scope.participants) {
          if ($scope.participants[i] === participant) {
            $scope.participants.splice(i, 1);
          }
        }
      } else {
        $scope.participant.$remove(function () {
          $location.path('participants');
        });
      }
    };
    // Update existing Participant
    $scope.update = function () {
      var participant = $scope.participant;
      participant.$update(function () {
        $location.path('participants/' + participant._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Participants
    $scope.find = function () {
      $scope.participants = Participants.query();
    };
    // Find existing Participant
    $scope.findOne = function () {
      $scope.participant = Participants.get({ participantId: $stateParams.participantId });
    };
  }
]);'use strict';
//Participants service used to communicate Participants REST endpoints
angular.module('participants').factory('Participants', [
  '$resource',
  function ($resource) {
    return $resource('participants/:participantId', { participantId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Configuring the Articles module
angular.module('recipes').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Recipes', 'recipes', 'dropdown', '/recipes(/create)?');
    Menus.addSubMenuItem('topbar', 'recipes', 'List Recipes', 'recipes');
    Menus.addSubMenuItem('topbar', 'recipes', 'New Recipe', 'recipes/create');
  }
]);'use strict';
//Setting up route
angular.module('recipes').config([
  '$stateProvider',
  function ($stateProvider) {
    // Recipes state routing
    $stateProvider.state('listRecipes', {
      url: '/recipes',
      templateUrl: 'modules/recipes/views/list-recipes.client.view.html'
    }).state('createRecipe', {
      url: '/recipes/create',
      templateUrl: 'modules/recipes/views/create-recipe.client.view.html'
    }).state('viewRecipe', {
      url: '/recipes/:recipeId',
      templateUrl: 'modules/recipes/views/view-recipe.client.view.html'
    }).state('editRecipe', {
      url: '/recipes/:recipeId/edit',
      templateUrl: 'modules/recipes/views/edit-recipe.client.view.html'
    });
  }
]);'use strict';
// Recipes controller
angular.module('recipes').controller('RecipesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Recipes',
  function ($scope, $stateParams, $location, Authentication, Recipes) {
    $scope.authentication = Authentication;
    // Create new Recipe
    $scope.create = function () {
      // Create new Recipe object
      var recipe = new Recipes({
          name: this.name,
          link: this.link,
          notes: this.notes
        });
      // Redirect after save
      recipe.$save(function (response) {
        console.log(recipe);
        $location.path('recipes');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing Recipe
    $scope.remove = function (recipe) {
      if (recipe) {
        recipe.$remove();
        for (var i in $scope.recipes) {
          if ($scope.recipes[i] === recipe) {
            $scope.recipes.splice(i, 1);
          }
        }
      } else {
        $scope.recipe.$remove(function () {
          $location.path('recipes');
        });
      }
    };
    // Update existing Recipe
    $scope.update = function () {
      var recipe = $scope.recipe;
      recipe.$update(function () {
        $location.path('recipes');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Recipes
    $scope.find = function () {
      $scope.recipes = Recipes.query();
    };
    // Find existing Recipe
    $scope.findOne = function () {
      $scope.recipe = Recipes.get({ recipeId: $stateParams.recipeId });
    };
  }
]);'use strict';
//Recipes service used to communicate Recipes REST endpoints
angular.module('recipes').factory('Recipes', [
  '$resource',
  function ($resource) {
    return $resource('recipes/:recipeId', { recipeId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('set-weight', {
      url: '/set-weight',
      templateUrl: 'modules/users/views/set-weight.client.view.html'
    }).state('weight-index', {
      url: '/home',
      templateUrl: 'modules/users/views/weightindex.client.view.html'
    }).state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/signin.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        //If successful we assign the response to the global user model
        $scope.authentication.user = response;
        //And redirect to the index page
        $location.path('/set-weight');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        //If successful we assign the response to the global user model
        $scope.authentication.user = response;
        //And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('weightController', [
  '$scope',
  '$stateParams',
  '$location',
  'socket',
  'Authentication',
  '$http',
  function ($scope, $stateParams, $location, socket, Authentication, $http) {
    $scope.authentication = Authentication;
    $scope.init = function () {
      if (!Authentication.user) {
        $location.path('/');
      } else {
        //grab user - if the starting weight is already set then re-direct
        var req = {};
        req.name = Authentication.user.displayName;
        $http.post('/getByName', req).success(function (data, status) {
          $scope.userData = data;
          if ($scope.userData.startingWeight > 40) {
            $location.path('/home');
          }
        });
      }
    };
    $scope.init();
    $scope.setWeight = function () {
      if (!$scope.input || !$scope.input.currWeight || !$scope.input.tarWeight) {
        console.log('input something');
      } else if ($scope.input.currWeight <= $scope.input.tarWeight) {
        console.log('not a real target');
      } else {
        var req = {};
        req.startingWeight = $scope.input.currWeight;
        req.targetWeight = $scope.input.tarWeight;
        req.name = Authentication.user.displayName;
        console.log(req);
        $http.post('/setInitialWeight', req).success(function (data, status) {
          $location.path('/home');
        });  //                // Redirect after save
             //                $scope.userData.$save(function(response) {
             //                    $location.path('/home');
             //                }, function(errorResponse) {
             //                    console.log(errorResponse.data.message);
             //                });
      }
    };  //                $scope.input.userId=Authentication.user.displayName;
        //                console.log($scope.input);
        //                socket.emit('setInitialWeight', $scope.input);
        //                
        //				//And redirect to the index page
        //				$location.path('/home');        
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function () {
      $scope.success = $scope.error = null;
      var user = new Users($scope.user);
      user.$update(function (response) {
        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('WeightindexController', [
  '$scope',
  '$stateParams',
  '$location',
  'socket',
  'Authentication',
  '$http',
  function ($scope, $stateParams, $location, socket, Authentication, $http) {
    /*********
        FUNCTIONS TO GET DATA
        *********/
    $scope.init = function () {
      if (!Authentication.user) {
        $location.path('/');
      } else {
        var req = {};
        req.name = Authentication.user.displayName;
        $http.get('/gvars').success(function (data, status) {
          $scope.weekNum = data[0].week;
          //get the user data
          //need to change these for when gvars get return the actual week number
          $scope.weeksFinished = $scope.weekNum - 1;
          $scope.inputError = true;
          if ($scope.weekNum === 1) {
            $scope.weekCheck = true;
          } else {
            $scope.weekCheck = false;
          }
        }).then(function () {
          console.log('logged');
          $http.post('/getByName', req).success(function (data, status) {
            $scope.userData = data;
            //                    console.log($scope.userData);
            //make sure they set the initial weight
            if (!$scope.userData.startingWeight) {
              $location.path('/set-weight');
            } else {
              //have to spell this out for ng-repeat
              $scope.weightHistory = $scope.userData.weightHistory;
              //set the placeholder
              if ($scope.userData.weightHistory[$scope.weekNum - 1]) {
                $scope.weightInput = $scope.userData.weightHistory[$scope.weekNum - 1];
              } else {
                $scope.weightInput = $scope.userData.weightHistory[$scope.userData.weightHistory.length - 1];
              }
              $scope.setMsgs();
            }
          });
        });
        $http.post('/getMyStats', req).success(function (data, status) {
          $scope.myStats = data;
        });
        socket.emit('getGraphData', req);
      }
    };
    $scope.init();
    socket.on('newWeek', function (data) {
      $scope.weekNum = data.week;
      if ($scope.weekNum === 1) {
        $scope.weekCheck = true;
      } else {
        $scope.weekCheck = false;
      }
      $scope.$digest();
    });
    socket.on('sendUserGraph', function (data) {
      $scope.graphData = data.graphData;
      $scope.userStats = data.userStats;
      $scope.$digest();
    });
    /*********
        FUNCTIONS TO ADD WEIGHT
        *********/
    $scope.addWeight = function () {
      if ($scope.weightInput <= 70) {
        $scope.inputError = 'I don\'t think that\'s possible';
        $scope.inputError = false;
      } else {
        $scope.inputError = true;
        $scope.input = {};
        $scope.input.weightInput = $scope.weightInput;
        $scope.input.week = $scope.weekNum;
        $scope.input.userId = $scope.userData._id;
        $scope.input.name = Authentication.user.displayName;
        var req = {};
        req.name = Authentication.user.displayName;
        $http.post('/addWeight', $scope.input).success(function (data, status) {
          $http.post('/getMyStats', req).success(function (data, status) {
            $scope.myStats = data;
            var req = {};
            req.name = Authentication.user.displayName;
            $http.post('/getByName', req).success(function (data, status) {
              $scope.userData = data;
              $scope.setMsgs();
            });
          });
          socket.emit('getGraphData', req);
        });  //                socket.emit('addWeight', $scope.input);                
      }
    };
    /*********
        SUPPORT FUNCTIONS
        *********/
    $scope.setMsgs = function () {
      //set the msg - first is week num, the amount to next milestone then amount to target
      console.log('week num ' + $scope.weekNum);
      if (($scope.weekNum - 1) % 4) {
        $scope.weekDiff = 4 - ($scope.weekNum - 1) % 4;
        if ($scope.weekDiff > 1) {
          $scope.msg1 = $scope.weekDiff + ' weeks to go until your next milestone';
        } else {
          $scope.msg1 = $scope.weekDiff + ' weeks to go until your next milestone';
        }
      } else {
        $scope.msg1 = 'It\'s milestone week. Time to PUSH';
      }
      //milestone            
      $scope.milestoneNum = (($scope.weekNum - 1) / 4).toFixed(0);
      console.log('milestone ' + (($scope.weekNum - 1) / 4).toFixed(0) + ' ' + $scope.milestoneNum);
      if ($scope.milestoneNum == 0) {
        console.log('0 milestone');
        $scope.msg2 = 'You have ' + ($scope.userData.weightHistory[$scope.userData.weightHistory.length - 1] - $scope.userData.milestones[$scope.milestoneNum]).toFixed(2) + ' lbs to go to get to it!';
      } else if ($scope.userData.milestones[$scope.milestoneNum - 1] < $scope.userData.weightHistory[$scope.userData.weightHistory.length - 1]) {
        $scope.msg2 = 'You have ' + ($scope.userData.weightHistory[$scope.userData.weightHistory.length - 1] - $scope.userData.milestones[$scope.milestoneNum - 1]).toFixed(2) + ' lbs to go to get to it!';
      } else {
        $scope.msg2 = 'Congrats you\'ve reached your next milestone. But don\'t slack off!';
      }
      //total
      if ($scope.userData.targetWeight < $scope.userData.weightHistory[$scope.userData.weightHistory.length - 1]) {
        //                console.log('other true');
        $scope.msg3 = ($scope.userData.weightHistory[$scope.userData.weightHistory.length - 1] - $scope.userData.targetWeight).toFixed(2) + ' lbs to go to your overall target';
      } else {
        $scope.msg3 = 'Congrats you\'ve reached your goal =) Now keep it off';
      }
    };
  }
]);'use strict';
angular.module('users').directive('testdirective', [function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        // Testdirective directive logic
        // ...
        element.text('this is the testdirective directive');
      }
    };
  }]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);
angular.module('users').factory('socket', function () {
  var socket = io.connect('/');
  //    var socket=io.connect('http://localhost:3000');
  return socket;
});'use strict';
// Configuring the Articles module
angular.module('workouts').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Workouts', 'workouts', 'dropdown', '/workouts(/create)?');
    Menus.addSubMenuItem('topbar', 'workouts', 'List Workouts', 'workouts');
    Menus.addSubMenuItem('topbar', 'workouts', 'New Workout', 'workouts/create');
  }
]);'use strict';
//Setting up route
angular.module('workouts').config([
  '$stateProvider',
  function ($stateProvider) {
    // Workouts state routing
    $stateProvider.state('listWorkouts', {
      url: '/workouts',
      templateUrl: 'modules/workouts/views/list-workouts.client.view.html'
    }).state('createWorkout', {
      url: '/workouts/create',
      templateUrl: 'modules/workouts/views/create-workout.client.view.html'
    }).state('viewWorkout', {
      url: '/workouts/:workoutId',
      templateUrl: 'modules/workouts/views/view-workout.client.view.html'
    }).state('editWorkout', {
      url: '/workouts/:workoutId/edit',
      templateUrl: 'modules/workouts/views/edit-workout.client.view.html'
    });
  }
]);'use strict';
// Workouts controller
angular.module('workouts').controller('WorkoutsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Workouts',
  function ($scope, $stateParams, $location, Authentication, Workouts) {
    $scope.authentication = Authentication;
    // Create new Workout
    $scope.create = function () {
      // Create new Workout object
      var workout = new Workouts({
          name: this.name,
          link: this.link,
          notes: this.notes
        });
      // Redirect after save
      workout.$save(function (response) {
        $location.path('workouts');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing Workout
    $scope.remove = function (workout) {
      if (workout) {
        workout.$remove();
        for (var i in $scope.workouts) {
          if ($scope.workouts[i] === workout) {
            $scope.workouts.splice(i, 1);
          }
        }
      } else {
        $scope.workout.$remove(function () {
          $location.path('workouts');
        });
      }
    };
    // Update existing Workout
    $scope.update = function () {
      var workout = $scope.workout;
      workout.$update(function () {
        $location.path('workouts');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Workouts
    $scope.find = function () {
      $scope.workouts = Workouts.query();
    };
    // Find existing Workout
    $scope.findOne = function () {
      $scope.workout = Workouts.get({ workoutId: $stateParams.workoutId });
    };
  }
]);'use strict';
//Workouts service used to communicate Workouts REST endpoints
angular.module('workouts').factory('Workouts', [
  '$resource',
  function ($resource) {
    return $resource('workouts/:workoutId', { workoutId: '@_id' }, { update: { method: 'PUT' } });
  }
]);