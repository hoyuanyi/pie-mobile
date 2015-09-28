angular.module('pie')

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
  $scope.username = AuthService.username();
  $scope.userrole = AuthService.role();

 
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
 
  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };

  $scope.setCurrentUserrole = function(role) {
    $scope.userrole = role;
  }

})

.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService, $ionicModal) {
  
  $ionicModal.fromTemplateUrl('templates/register.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openRegisterModal = function() {
    $scope.modal.show();
  };
  $scope.closeRegisterModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  $scope.data = {};
 
  $scope.login = function(data) {
    AuthService.login(data.username, data.password).then(function(authenticated) {
      $state.go('nav.dashboard', {}, {reload: true});
      $scope.setCurrentUsername(data.username);
      $scope.setCurrentUserrole(AuthService.role());
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };
})

.controller('NavCtrl', function($scope, $state, $ionicHistory, AuthService, USER_ROLES) {

  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
    $scope.$root.enableRight = false;
  };

  $scope.displaySideMenu = function() {
    var isOnRightView = ['nav.notes', 'nav.homework', 'nav.events'].indexOf($ionicHistory.currentStateName()) > -1;
    var isParent = AuthService.role() == 'parent_role';
    return isOnRightView && isParent;
  }

  $scope.displayJoinGroup = function() {
    var isOnRightView = $ionicHistory.currentStateName() == 'nav.groups';
    var isStudent = AuthService.role() == 'student_role';
    return isOnRightView && isStudent;
  }

})

.controller('DashboardCtrl', function($scope, $state, $http, $ionicPopup, AuthService, REMOTE) {
 
  $scope.performValidRequest = function() {
    $http.get(REMOTE.url + 'valid').then(
      function(result) {
        $scope.response = result;
      });
  };
 
  $scope.performUnauthorizedRequest = function() {
    $http.get(REMOTE.url + 'notauthorized').then(
      function(result) {

      }, function(err) {
        $scope.response = err;
      });
  };
 
  $scope.performInvalidRequest = function() {
    $http.get(REMOTE.url + 'notauthenticated').then(
      function(result) {
      	
      }, function(err) {
        $scope.response = err;
      });
  };
})

.controller('AccountCtrl', function() {

})

.controller('NotesCtrl', function($scope) {
  $scope.filter = {
    searchUnread : "",
    searchAll : "",
    searchArchive : ""
  };

  $scope.onSearchChange = function(filter) {
    if (filter == 'unread') {
      //console.log($scope.filter.searchUnread);
    }
    if (filter == 'all') {
      //console.log($scope.filter.searchAll);
    }
    if (filter == 'archive') {
      //console.log($scope.filter.searchArchive);
    }
  }

  $scope.clearSearch = function(filter) {
    if (filter == 'unread') {
      $scope.filter.searchUnread = "";
    }
    if (filter == 'all') {
      $scope.filter.searchAll = "";
    }
    if (filter == 'archive') {
      $scope.filter.searchArchive = "";
    }
    $scope.onSearchChange(filter);
  }
})

.controller('EventsCtrl', function() {

})

.controller('HomeworkCtrl', function() {

})

.controller('SchoolsCtrl', function() {

})

.controller('GroupsCtrl', function() {

})

.controller('ChildrenCtrl', function() {

})

.controller('StatusCtrl', function() {

})

.controller('SettingsCtrl', function() {

});
