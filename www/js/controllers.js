angular.module('pie')

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, ParentService, AUTH_EVENTS) {

  Ionic.io();
  $scope.user = Ionic.User.current();
  $scope.children = window.localStorage.getItem("children");

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

  $scope.updateChildren = function() {
    $scope.children = ParentService.getChildren($scope.user);
    window.localStorage.setItem("children", $scope.children);
  }

})

.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService, ParentService, StudentService, $ionicModal, $ionicLoading) {

  $scope.loginData = {};
  $scope.registrationData = {};

  $ionicModal.fromTemplateUrl('userType.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.userTypeModal = modal;
  });

  $ionicModal.fromTemplateUrl('parentRegister.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.parentRegistrationModal = modal;
  });

  $ionicModal.fromTemplateUrl('studentRegister.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.studentRegistrationModal = modal;
  });

  $scope.$on('modal.hidden', function() {
    for (var parameter in $scope.registrationData) {
      if ($scope.registrationData.hasOwnProperty(parameter)) {
        $scope.registrationData[parameter] = "";
      }
    }
  });

  $scope.$on('$destroy', function() {
    $scope.userTypeModal.remove();
    $scope.parentRegistrationModal.remove();
    $scope.studentRegistrationModal.remove();
  });
 
  $scope.login = function(loginData) {

    if (loginData.userEmail && loginData.userPassword) {
      AuthService.login(loginData).then(function(data) {

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

        if (user.get('userType') == 'PARENT') {
          $scope.updateChildren();
        }

        $state.go('nav.dashboard', {}, {reload: true});

      }, function(error) {
        var alertPopup = $ionicPopup.alert({
          title: 'Login failed!',
          template: error
        });
      });
    }
  };

  $scope.registerParent = function(registrationData) {

    if (registrationData.userFirstName && registrationData.userLastName && registrationData.userEmail && registrationData.userPassword && registrationData.confirmPassword) {
      if (registrationData.userPassword == registrationData.confirmPassword) {

        $ionicLoading.show({
          animation: 'fade-in',
          showBackdrop: true,
          showDelay: 0
        });

        ParentService.register(registrationData).then(function(data) {          
          $scope.parentRegistrationModal.hide();
          $scope.userTypeModal.hide();
          $ionicLoading.hide();
          var alertPopup = $ionicPopup.alert({
            title: 'Registration successful!',
            template: data
          });
        }, function(error) {
          $ionicLoading.hide();
          var alertPopup = $ionicPopup.alert({
            title: 'Registration failed!',
            template: error
          });
        })
      } else {
        var alertPopup = $ionicPopup.alert({
          title: 'Invalid data!',
          template: "Passwords do not match!"
        });
      }
    }
  };

  $scope.registerStudent = function(registrationData) {

    if (registrationData.studentCode && registrationData.userEmail && registrationData.userPassword && registrationData.confirmPassword) {
      if (registrationData.userPassword == registrationData.confirmPassword) {

        $ionicLoading.show({
          animation: 'fade-in',
          showBackdrop: true,
          showDelay: 0
        });

        StudentService.register(registrationData).then(function(data) {          
          $scope.studentRegistrationModal.hide();
          $scope.userTypeModal.hide();
          $ionicLoading.hide();
          var alertPopup = $ionicPopup.alert({
            title: 'Registration successful!',
            template: data
          });
        }, function(error) {
          $ionicLoading.hide();
          var alertPopup = $ionicPopup.alert({
            title: 'Registration failed!',
            template: error
          });
        })
      } else {
        var alertPopup = $ionicPopup.alert({
          title: 'Invalid data!',
          template: "Passwords do not match!"
        });
      }
    }
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
  };

  $scope.displayJoinGroup = function() {
    var isOnRightView = $ionicHistory.currentStateName() == 'nav.groups';
    var isStudent = $scope.user.get('userType')  == 'STUDENT';
    return isOnRightView && isStudent;
  };

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

.controller('ChildDetailsCtrl', function($scope, $ionicPopup, $ionicModal) {
  $scope.groups = [{name:"2E5 2016", pass:0}, {name:"2E6 2016", pass:1}];

  $scope.responses = [];

  $scope.showAddGroupPassPopup = function(group) {
  $scope.data = {};
  if(group.pass == 0){
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
              //don't allow the user to close unless he enters group code.
              e.preventDefault();
            } else {
              $scope.responses.push(group.name);
              console.log($scope.responses);
              return $scope.data;
            }
          }
        }
      ]
    });
    addGroupPopup.then(function(res) {
      console.log('Tapped!', res);
    });
  } else {
    alert("No password needed for group");
    $scope.responses.push(group.name);
  } 
};

  $ionicModal.fromTemplateUrl('listOfGroups.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.listOfGroups = modal;
  });

  $scope.$on('modal.hidden', function() {

  });

  $scope.$on('$destroy', function() {
    $scope.listOfGroups.remove();
  });

})

.controller('StatusCtrl', function() {

})

.controller('SettingsCtrl', function() {

});
