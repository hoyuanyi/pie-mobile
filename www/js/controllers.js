angular.module('pie')

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {

  Ionic.io();
  $scope.user = Ionic.User.current();

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
      template: 'Please login again.'
    });
  });

  $scope.setUser = function(user) {
    $scope.user = user;
  }

})

.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService, $ionicModal) {

  $scope.registerParentInfo = {};
  $scope.registerStudentInfo = {};

  $ionicModal.fromTemplateUrl('chooseType.html', {
    id : '1',
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal1 = modal;
  });

  $ionicModal.fromTemplateUrl('parentRegister.html', {
    id : '2',
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal2 = modal;
  });

  $ionicModal.fromTemplateUrl('childRegister.html', {
    id : '3',
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal3 = modal;
  });

  $scope.openRegisterModal = function(index) {
    if(index == 1) {
      $scope.modal1.show();
    } else if(index == 2) {
      $scope.modal2.show();
    } else {
      $scope.modal3.show();
    }
  };
  $scope.closeRegisterModal = function(index) {
    if(index == 1) {
      $scope.modal1.hide();
    } else if(index == 2) {
      $scope.modal2.hide();
    } else {
      $scope.modal3.hide();
    }
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal1.remove();
    $scope.modal2.remove();
    $scope.modal3.remove();
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
 
  $scope.login = function(loginData) {
    AuthService.login(loginData.userEmail, loginData.userPassword).then(function(data) {

      Ionic.io();
      var push = new Ionic.Push();
      push.register();
      var user = Ionic.User.current();
      if (!user.id) {
        user.id = data.userID + '@' + data.userFirstName + data.userLastName
      }
      user.set('userEmail', data.userEmail);
      user.set('userFirstName', data.userFirstName);
      user.set('userLastName', data.userLastName);
      user.set('userMobile', data.userMobile);
      user.set('userType', data.userType);
      push.addTokenToUser(user);
      user.save();

      $scope.setUser(user);

      $state.go('nav.dashboard', {}, {reload: true});

    }, function(error) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: error
      });
    });
  };
})

.controller('NavCtrl', function($window, $scope, $state, $ionicHistory, AuthService, USER_ROLES) {

  $scope.logout = function() {
    $window.localStorage.clear();
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    AuthService.logout();
    $state.go('login');
    $scope.$root.enableRight = false;
  };

  $scope.displaySideMenu = function() {
    var isOnRightView = ['nav.notes', 'nav.homework', 'nav.events'].indexOf($ionicHistory.currentStateName()) > -1;
    var isParent = $scope.user.get('userType') == 'PARENT';
    return isOnRightView && isParent;
  }

  $scope.displayJoinGroup = function() {
    var isOnRightView = $ionicHistory.currentStateName() == 'nav.groups';
    var isStudent = $scope.user.get('userType')  == 'STUDENT';
    return isOnRightView && isStudent;
  }

})

.controller('DashboardCtrl', function($scope, $state, $http, $ionicPopup, REMOTE) {
 
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

.controller('ChildrenCtrl', function($scope, $ionicPopup, $state) {

  $scope.responses = [];

  $scope.showPopup = function() {
  $scope.data = {};

  var myPopup = $ionicPopup.show({
    template: '<input type="text" ng-model="data.studentcode" autofocus placeholder="Student code"></br>Relationship: <select ng-model="data.relationship"><option value="1">Parent</option><option value="2">Guardian</option></select>',
    title: 'Add Child',
    subTitle: 'Enter Student Code & Relationship',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Submit</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.studentcode || !$scope.data.relationship) {
            //don't allow the user to close unless he enters studentcode and relationship
            e.preventDefault();
          } else {
            $scope.data.username = "Ho Yuan Yi";
            $scope.data.group = "2E4 2015";
            $scope.responses.push($scope.data);
            return $scope.data;
          }
        }
      }
    ]
  });
  myPopup.then(function(res) {
    console.log('Tapped!', res);
  });
 };

  $scope.getChildDetails = function() {
    $state.go('nav.childrendetails');
  }

})

.controller('ChildDetailsCtrl', function($scope, $ionicPopup) {

  $scope.responses = [];

  $scope.showAddGroupPopup = function() {
  $scope.data = {};

  var addGroupPopup = $ionicPopup.show({
    template: '<input type="text" ng-model="data.groupcode" autofocus placeholder="Group code">',
    title: 'Join Group',
    subTitle: 'Enter Group Code',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Submit</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.groupcode) {
            //don't allow the user to close unless he enters studentcode and relationship
            e.preventDefault();
          } else {
            $scope.responses.push($scope.data);
            return $scope.data;
          }
        }
      }
    ]
  });
  addGroupPopup.then(function(res) {
    console.log('Tapped!', res);
  });
 };

})

.controller('StatusCtrl', function() {

})

.controller('SettingsCtrl', function() {

});
