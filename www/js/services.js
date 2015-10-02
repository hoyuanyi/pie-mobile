angular.module('pie')

.service('AuthService', function($q, $http, USER_ROLES, REMOTE) {

  var LOCAL_TOKEN_KEY = 'USER_TOKEN';
  var LOCAL_USER_TYPE_KEY = 'USER_TYPE';
  var isAuthenticated = false;
  var verifiedUserType = undefined;
 
  function loadUserData() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    var userType = window.localStorage.getItem(LOCAL_USER_TYPE_KEY);
    if (token && userType) {
      authenticateUser(token);
      verifyUserType(userType);
    }
  }

  function authenticateUser(token) {
    isAuthenticated = true;
    $http.defaults.headers.common['X-Auth-Token'] = token;
  }
 
  function verifyUserType(userType) {
    if (userType == 'ADMIN') {
      verifiedUserType = USER_ROLES.admin
    }
    if (userType == 'PARENT') {
      verifiedUserType = USER_ROLES.parent
    }
    if (userType == 'STAFF') {
      verifiedUserType = USER_ROLES.staff
    }
    if (userType == 'STUDENT') {
      verifiedUserType = USER_ROLES.student
    }
  }
 
  function destroyUserCredentials() {
    isAuthenticated = false;
    $http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    window.localStorage.removeItem(LOCAL_USER_TYPE_KEY);
  }
 
  var login = function(userEmail, userPassword) {
    var deferred = $q.defer();

    var request = {
      method: 'POST',
      url: REMOTE.url + 'login',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      data : 'userEmail=' + userEmail + '&userPassword=' + userPassword + '&platformID=' + REMOTE.platformID
    }
    $http(request).success(function(data, status, headers, config) {
      if (data.result == 'SUCCESS') {
        
        var userToken = headers('X-Auth-Token');
        authenticateUser(userToken);
        window.localStorage.setItem(LOCAL_TOKEN_KEY, userToken);

        var userType = data.user.userType;
        verifyUserType(userType);
        window.localStorage.setItem(LOCAL_USER_TYPE_KEY, userType);

        deferred.resolve(data.user);
      } else {
        deferred.reject(data.message);
      }
    }).error(function(data, status, header, config) {
      deferred.reject("Connection cannot be established! Please check your internet connection and try again.");
    });

    return deferred.promise;
  };
 
  var logout = function() {
    destroyUserCredentials();
  };
 
  var isAuthorized = function(authorizedUserTypes) {
    if (!angular.isArray(authorizedUserTypes)) {
      authorizedUserTypes = [authorizedUserTypes];
    }
    return (isAuthenticated && authorizedUserTypes.indexOf(verifiedUserType) !== -1);
  };
 
  loadUserData();
 
  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;}
  };
});