angular.module('pie', ['ionic','ionic.service.core', 'ngResource'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, USER_ROLES) {
  $stateProvider

  .state('login', {
    url : '/login',
    templateUrl : 'templates/login.html',
    controller : 'LoginCtrl'
  })

  .state('nav', {
    url: '/nav',
    abstract: true,
    templateUrl: 'templates/nav.html',
    controller: 'NavCtrl'
  })

  .state('nav.dashboard', {
    url: '/dashboard',
    views: {
      'navContent': {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl'
      }
    }
  })

  .state('nav.account', {
    url: '/account',
    views: {
      'navContent': {
        templateUrl: 'templates/account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('nav.notes', {
    url: '/notes',
    views: {
      'navContent': {
        templateUrl: 'templates/notes.html',
        controller: 'NotesCtrl'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.teacher, USER_ROLES.student, USER_ROLES.parent]
    }
  })

  .state('nav.events', {
    url: '/events',
    views: {
      'navContent': {
        templateUrl: 'templates/events.html',
        controller: 'EventsCtrl'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.teacher, USER_ROLES.student, USER_ROLES.parent]
    }
  })

  .state('nav.homework', {
    url: '/homework',
    views: {
      'navContent': {
        templateUrl: 'templates/homework.html',
        controller: 'HomeworkCtrl'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.teacher, USER_ROLES.student, USER_ROLES.parent]
    }
  })

  .state('nav.schools', {
    url: '/schools',
    views: {
      'navContent': {
        templateUrl: 'templates/schools.html',
        controller: 'SchoolsCtrl'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin]
    }
  })

  .state('nav.status', {
    url: '/status',
    views: {
      'navContent': {
        templateUrl: 'templates/status.html',
        controller: 'StatusCtrl'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin]
    }
  })

  .state('nav.children', {
    url: '/children',
    views: {
      'navContent': {
        templateUrl: 'templates/children.html',
        controller: 'ChildrenCtrl'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.parent]
    }
  })

  .state('nav.childrendetails', {
    url: '/childrenDetails',
    views: {
      'navContent': {
        templateUrl: 'templates/childrenDetails.html',
        controller: 'ChildDetailsCtrl'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.parent]
    }
  })

  .state('nav.groups', {
    url: '/groups',
    views: {
      'navContent': {
        templateUrl: 'templates/groups.html',
        controller: 'GroupsCtrl'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.teacher, USER_ROLES.student]
    }
  })

  .state('nav.settings', {
    url: '/settings',
    views: {
      'navContent': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise(function ($injector, $location) {
    var $state = $injector.get("$state");
    $state.go("nav.dashboard");
  });
})

// .run(function($httpBackend, REMOTE) {
//   $httpBackend.whenPOST(REMOTE.url + 'login').respond({result:'SUCCESS', user: {userFirstName: 'Test', userLastName: 'User', userEmail: 'test@test.com', userType: 'PARENT', userMobile: ''}});

//   $httpBackend.whenGET(/templates\/\w+.*/).passThrough();
// })

.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
 
    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }
 
    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login') {
        event.preventDefault();
        $state.go('login');
      }
    }
  });
});
