'use strict';
var ApplicationConfiguration = function () {
    var applicationModuleName = 'svensicabiggestloser', applicationModuleVendorDependencies = [
        'ngResource',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.utils',
        'nvd3ChartDirectives'
      ], registerModule = function (moduleName) {
        angular.module(moduleName, []), angular.module(applicationModuleName).requires.push(moduleName);
      };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies), angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]), angular.element(document).ready(function () {
  '#_=_' === window.location.hash && (window.location.hash = '#!'), angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
}), ApplicationConfiguration.registerModule('core'), ApplicationConfiguration.registerModule('gvars'), ApplicationConfiguration.registerModule('participants'), ApplicationConfiguration.registerModule('recipes'), ApplicationConfiguration.registerModule('users'), ApplicationConfiguration.registerModule('workouts'), angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/'), $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/participants/views/homepg.client.view.html'
    });
  }
]), angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  function ($scope, Authentication, Menus) {
    $scope.authentication = Authentication, $scope.isCollapsed = !1, $scope.menu = Menus.getMenu('topbar'), $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    }, $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = !1;
    });
  }
]), angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  function ($scope, Authentication) {
    $scope.authentication = Authentication;
  }
]), angular.module('core').service('Menus', [function () {
    this.defaultRoles = ['user'], this.menus = {};
    var shouldRender = function (user) {
      if (!user)
        return this.isPublic;
      for (var userRoleIndex in user.roles)
        for (var roleIndex in this.roles)
          if (this.roles[roleIndex] === user.roles[userRoleIndex])
            return !0;
      return !1;
    };
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId])
          return !0;
        throw new Error('Menu does not exists');
      }
      throw new Error('MenuId was not provided');
    }, this.getMenu = function (menuId) {
      return this.validateMenuExistance(menuId), this.menus[menuId];
    }, this.addMenu = function (menuId, isPublic, roles) {
      return this.menus[menuId] = {
        isPublic: isPublic || !1,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      }, this.menus[menuId];
    }, this.removeMenu = function (menuId) {
      this.validateMenuExistance(menuId), delete this.menus[menuId];
    }, this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles) {
      return this.validateMenuExistance(menuId), this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic || this.menus[menuId].isPublic,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      }), this.menus[menuId];
    }, this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles) {
      this.validateMenuExistance(menuId);
      for (var itemIndex in this.menus[menuId].items)
        this.menus[menuId].items[itemIndex].link === rootMenuItemURL && this.menus[menuId].items[itemIndex].items.push({
          title: menuItemTitle,
          link: menuItemURL,
          uiRoute: menuItemUIRoute || '/' + menuItemURL,
          isPublic: isPublic || this.menus[menuId].isPublic,
          roles: roles || this.defaultRoles,
          shouldRender: shouldRender
        });
      return this.menus[menuId];
    }, this.removeMenuItem = function (menuId, menuItemURL) {
      this.validateMenuExistance(menuId);
      for (var itemIndex in this.menus[menuId].items)
        this.menus[menuId].items[itemIndex].link === menuItemURL && this.menus[menuId].items.splice(itemIndex, 1);
      return this.menus[menuId];
    }, this.removeSubMenuItem = function (menuId, submenuItemURL) {
      this.validateMenuExistance(menuId);
      for (var itemIndex in this.menus[menuId].items)
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items)
          this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL && this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
      return this.menus[menuId];
    }, this.addMenu('topbar');
  }]), angular.module('gvars').config([
  '$stateProvider',
  function ($stateProvider) {
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
]), angular.module('gvars').controller('GvarsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Gvars',
  function ($scope, $stateParams, $location, Authentication, Gvars) {
    $scope.authentication = Authentication, $scope.create = function () {
      var gvar = new Gvars({ name: this.name });
      gvar.$save(function (response) {
        $location.path('gvars/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      }), this.name = '';
    }, $scope.remove = function (gvar) {
      if (gvar) {
        gvar.$remove();
        for (var i in $scope.gvars)
          $scope.gvars[i] === gvar && $scope.gvars.splice(i, 1);
      } else
        $scope.gvar.$remove(function () {
          $location.path('gvars');
        });
    }, $scope.update = function () {
      var gvar = $scope.gvar;
      gvar.$update(function () {
        $location.path('gvars/' + gvar._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.find = function () {
      $scope.gvars = Gvars.query();
    }, $scope.findOne = function () {
      $scope.gvar = Gvars.get({ gvarId: $stateParams.gvarId });
    };
  }
]), angular.module('gvars').factory('Gvars', [
  '$resource',
  function ($resource) {
    return $resource('gvars/:gvarId', { gvarId: '@_id' }, { update: { method: 'PUT' } });
  }
]), angular.module('participants').config([
  '$stateProvider',
  function ($stateProvider) {
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
]), angular.module('participants').controller('HomepgController', [
  '$scope',
  '$location',
  'Authentication',
  function ($scope, $location, Authentication) {
    Authentication.user && $location.path('/home');
  }
]), angular.module('participants').controller('ParticipantsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Participants',
  function ($scope, $stateParams, $location, Authentication, Participants) {
    $scope.authentication = Authentication, $scope.create = function () {
      var participant = new Participants({ name: this.name });
      participant.$save(function (response) {
        $location.path('participants/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      }), this.name = '';
    }, $scope.remove = function (participant) {
      if (participant) {
        participant.$remove();
        for (var i in $scope.participants)
          $scope.participants[i] === participant && $scope.participants.splice(i, 1);
      } else
        $scope.participant.$remove(function () {
          $location.path('participants');
        });
    }, $scope.update = function () {
      var participant = $scope.participant;
      participant.$update(function () {
        $location.path('participants/' + participant._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.find = function () {
      $scope.participants = Participants.query();
    }, $scope.findOne = function () {
      $scope.participant = Participants.get({ participantId: $stateParams.participantId });
    };
  }
]), angular.module('participants').factory('Participants', [
  '$resource',
  function ($resource) {
    return $resource('participants/:participantId', { participantId: '@_id' }, { update: { method: 'PUT' } });
  }
]), angular.module('recipes').run([
  'Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', 'Recipes', 'recipes', 'dropdown', '/recipes(/create)?'), Menus.addSubMenuItem('topbar', 'recipes', 'List Recipes', 'recipes'), Menus.addSubMenuItem('topbar', 'recipes', 'New Recipe', 'recipes/create');
  }
]), angular.module('recipes').config([
  '$stateProvider',
  function ($stateProvider) {
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
]), angular.module('recipes').controller('RecipesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Recipes',
  function ($scope, $stateParams, $location, Authentication, Recipes) {
    $scope.authentication = Authentication, $scope.create = function () {
      var recipe = new Recipes({
          name: this.name,
          link: this.link,
          notes: this.notes
        });
      recipe.$save(function () {
        console.log(recipe), $location.path('recipes');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      }), this.name = '';
    }, $scope.remove = function (recipe) {
      if (recipe) {
        recipe.$remove();
        for (var i in $scope.recipes)
          $scope.recipes[i] === recipe && $scope.recipes.splice(i, 1);
      } else
        $scope.recipe.$remove(function () {
          $location.path('recipes');
        });
    }, $scope.update = function () {
      var recipe = $scope.recipe;
      recipe.$update(function () {
        $location.path('recipes');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.find = function () {
      $scope.recipes = Recipes.query();
    }, $scope.findOne = function () {
      $scope.recipe = Recipes.get({ recipeId: $stateParams.recipeId });
    };
  }
]), angular.module('recipes').factory('Recipes', [
  '$resource',
  function ($resource) {
    return $resource('recipes/:recipeId', { recipeId: '@_id' }, { update: { method: 'PUT' } });
  }
]), angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              Authentication.user = null, $location.path('signin');
              break;
            case 403:
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]), angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
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
]), angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication, $scope.authentication.user && $location.path('/'), $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        $scope.authentication.user = response, $location.path('/set-weight');
      }).error(function (response) {
        $scope.error = response.message;
      });
    }, $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        $scope.authentication.user = response, $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]), angular.module('users').controller('weightController', [
  '$scope',
  '$stateParams',
  '$location',
  'socket',
  'Authentication',
  '$http',
  function ($scope, $stateParams, $location, socket, Authentication, $http) {
    $scope.authentication = Authentication, $scope.init = function () {
      if (Authentication.user) {
        var req = {};
        req.name = Authentication.user.displayName, $http.post('/getByName', req).success(function (data) {
          $scope.userData = data, $scope.userData.startingWeight > 40 && $location.path('/home');
        });
      } else
        $location.path('/');
    }, $scope.init(), $scope.setWeight = function () {
      if ($scope.input && $scope.input.currWeight && $scope.input.tarWeight)
        if ($scope.input.currWeight <= $scope.input.tarWeight)
          console.log('not a real target');
        else {
          var req = {};
          req.startingWeight = $scope.input.currWeight, req.targetWeight = $scope.input.tarWeight, req.name = Authentication.user.displayName, console.log(req), $http.post('/setInitialWeight', req).success(function () {
            $location.path('/home');
          });
        }
      else
        console.log('input something');
    };
  }
]), angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user, $scope.user || $location.path('/'), $scope.hasConnectedAdditionalSocialAccounts = function () {
      for (var i in $scope.user.additionalProvidersData)
        return !0;
      return !1;
    }, $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    }, $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null, $http['delete']('/users/accounts', { params: { provider: provider } }).success(function (response) {
        $scope.success = !0, $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    }, $scope.updateUserProfile = function () {
      $scope.success = $scope.error = null;
      var user = new Users($scope.user);
      user.$update(function (response) {
        $scope.success = !0, Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    }, $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null, $http.post('/users/password', $scope.passwordDetails).success(function () {
        $scope.success = !0, $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]), angular.module('users').controller('WeightindexController', [
  '$scope',
  '$stateParams',
  '$location',
  'socket',
  'Authentication',
  '$http',
  function ($scope, $stateParams, $location, socket, Authentication, $http) {
    $scope.init = function () {
      if (Authentication.user) {
        var req = {};
        req.name = Authentication.user.displayName, $http.get('/gvars').success(function (data) {
          $scope.weekNum = data[0].week, $scope.weeksFinished = $scope.weekNum - 1, $scope.inputError = !0, $scope.weekCheck = 1 === $scope.weekNum ? !0 : !1;
        }).then(function () {
          console.log('logged'), $http.post('/getByName', req).success(function (data) {
            $scope.userData = data, $scope.userData.startingWeight ? ($scope.weightHistory = $scope.userData.weightHistory, $scope.weightInput = $scope.userData.weightHistory[$scope.weekNum - 1] ? $scope.userData.weightHistory[$scope.weekNum - 1] : $scope.userData.weightHistory[$scope.userData.weightHistory.length - 1], $scope.setMsgs()) : $location.path('/set-weight');
          });
        }), $http.post('/getMyStats', req).success(function (data) {
          $scope.myStats = data;
        }), socket.emit('getGraphData', req);
      } else
        $location.path('/');
    }, $scope.init(), socket.on('newWeek', function (data) {
      $scope.weekNum = data.week, $scope.weekCheck = 1 === $scope.weekNum ? !0 : !1, $scope.$digest();
    }), socket.on('sendUserGraph', function (data) {
      $scope.graphData = data.graphData, $scope.userStats = data.userStats, $scope.$digest();
    }), $scope.addWeight = function () {
      if ($scope.weightInput <= 70)
        $scope.inputError = 'I don\'t think that\'s possible', $scope.inputError = !1;
      else {
        $scope.inputError = !0, $scope.input = {}, $scope.input.weightInput = $scope.weightInput, $scope.input.week = $scope.weekNum, $scope.input.userId = $scope.userData._id, $scope.input.name = Authentication.user.displayName;
        var req = {};
        req.name = Authentication.user.displayName, $http.post('/addWeight', $scope.input).success(function () {
          $http.post('/getMyStats', req).success(function (data) {
            $scope.myStats = data;
            var req = {};
            req.name = Authentication.user.displayName, $http.post('/getByName', req).success(function (data) {
              $scope.userData = data, $scope.setMsgs();
            });
          }), socket.emit('getGraphData', req);
        });
      }
    }, $scope.setMsgs = function () {
      console.log('week num ' + $scope.weekNum), ($scope.weekNum - 1) % 4 ? ($scope.weekDiff = 4 - ($scope.weekNum - 1) % 4, $scope.msg1 = $scope.weekDiff > 1 ? $scope.weekDiff + ' weeks to go until your next milestone' : $scope.weekDiff + ' weeks to go until your next milestone') : $scope.msg1 = 'It\'s milestone week. Time to PUSH', $scope.milestoneNum = (($scope.weekNum - 1) / 4).toFixed(0), console.log('milestone ' + (($scope.weekNum - 1) / 4).toFixed(0) + ' ' + $scope.milestoneNum), 0 == $scope.milestoneNum ? (console.log('0 milestone'), $scope.msg2 = 'You have ' + ($scope.userData.weightHistory[$scope.userData.weightHistory.length - 1] - $scope.userData.milestones[$scope.milestoneNum]).toFixed(2) + ' lbs to go to get to it!') : $scope.msg2 = $scope.userData.milestones[$scope.milestoneNum - 1] < $scope.userData.weightHistory[$scope.userData.weightHistory.length - 1] ? 'You have ' + ($scope.userData.weightHistory[$scope.userData.weightHistory.length - 1] - $scope.userData.milestones[$scope.milestoneNum - 1]).toFixed(2) + ' lbs to go to get to it!' : 'Congrats you\'ve reached your next milestone. But don\'t slack off!', $scope.msg3 = $scope.userData.targetWeight < $scope.userData.weightHistory[$scope.userData.weightHistory.length - 1] ? ($scope.userData.weightHistory[$scope.userData.weightHistory.length - 1] - $scope.userData.targetWeight).toFixed(2) + ' lbs to go to your overall target' : 'Congrats you\'ve reached your goal =) Now keep it off';
    };
  }
]), angular.module('users').directive('testdirective', [function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function (scope, element) {
        element.text('this is the testdirective directive');
      }
    };
  }]), angular.module('users').factory('Authentication', [function () {
    var _this = this;
    return _this._data = { user: window.user }, _this._data;
  }]), angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]), angular.module('users').factory('socket', function () {
  var socket = io.connect('/');
  return socket;
}), angular.module('workouts').run([
  'Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', 'Workouts', 'workouts', 'dropdown', '/workouts(/create)?'), Menus.addSubMenuItem('topbar', 'workouts', 'List Workouts', 'workouts'), Menus.addSubMenuItem('topbar', 'workouts', 'New Workout', 'workouts/create');
  }
]), angular.module('workouts').config([
  '$stateProvider',
  function ($stateProvider) {
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
]), angular.module('workouts').controller('WorkoutsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Workouts',
  function ($scope, $stateParams, $location, Authentication, Workouts) {
    $scope.authentication = Authentication, $scope.create = function () {
      var workout = new Workouts({
          name: this.name,
          link: this.link,
          notes: this.notes
        });
      workout.$save(function () {
        $location.path('workouts');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      }), this.name = '';
    }, $scope.remove = function (workout) {
      if (workout) {
        workout.$remove();
        for (var i in $scope.workouts)
          $scope.workouts[i] === workout && $scope.workouts.splice(i, 1);
      } else
        $scope.workout.$remove(function () {
          $location.path('workouts');
        });
    }, $scope.update = function () {
      var workout = $scope.workout;
      workout.$update(function () {
        $location.path('workouts');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.find = function () {
      $scope.workouts = Workouts.query();
    }, $scope.findOne = function () {
      $scope.workout = Workouts.get({ workoutId: $stateParams.workoutId });
    };
  }
]), angular.module('workouts').factory('Workouts', [
  '$resource',
  function ($resource) {
    return $resource('workouts/:workoutId', { workoutId: '@_id' }, { update: { method: 'PUT' } });
  }
]);