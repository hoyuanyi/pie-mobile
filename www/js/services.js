angular.module('pie')

.service('ParentService', function($q, $http, REMOTE) {

  var register = function(registrationData) {
    var deferred = $q.defer();

    var request = {
      method: 'POST',
      url: REMOTE.url + 'registerparent',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      data: {
        userFirstName: registrationData.userFirstName,
        userLastName: registrationData.userLastName,
        userEmail: registrationData.userEmail,
        userPassword: registrationData.userPassword,
        userMobile: registrationData.userMobile
      }
    }
    $http(request).success(function(data, status, headers, config) {
      if (data.result == 'SUCCESS') {
        deferred.resolve(data.message);
      } else {
        deferred.reject(data.message);
      }
    }).error(function(data, status, header, config) {
      deferred.reject("Connection cannot be established! Please check your internet connection and try again.");
    });

    return deferred.promise;
  }

  var getChildren = function(user) {
    var deferred = $q.defer();

    var request = {
      method: 'GET',
      url: REMOTE.url + 'secured/parent/children',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      params: {
        parentID: user.get("userID")
      }
    }
    $http(request).success(function(data, status, headers, config) {
      deferred.resolve(data.parentChildren);
    }).error(function(data, status, header, config) {
      deferred.reject("Connection cannot be established! Please check your internet connection and try again.");
    });

    return deferred.promise;
  }

  return {
    getChildren: getChildren,
    register: register
  };
})

.service('StudentService', function($q, $http, REMOTE) {

  var getJoinedGroups = function(studentID, callback) {
    $http.get(REMOTE.url + '/secured/student/joinedgroups').success(function(data) {
      callback(data);
    })
  }

  var register = function(registrationData) {
    var deferred = $q.defer();

    var request = {
      method: 'POST',
      url: REMOTE.url + 'registerstudent',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      data: {
        studentCode: registrationData.studentCode,
        userEmail: registrationData.userEmail,
        userPassword: registrationData.userPassword,
        userMobile: registrationData.userMobile
      }
    }
    $http(request).success(function(data, status, headers, config) {
      if (data.result == 'SUCCESS') {
        deferred.resolve(data.message);
      } else {
        deferred.reject(data.message);
      }
    }).error(function(data, status, header, config) {
      deferred.reject("Connection cannot be established! Please check your internet connection and try again.");
    });

    return deferred.promise;
  }

  return {
    getJoinedGroups: getJoinedGroups,
    register: register
  }
})

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
 
  var login = function(loginData) {
    var deferred = $q.defer();

    var request = {
      method: 'POST',
      url: REMOTE.url + 'login',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      data : {
        userEmail: loginData.userEmail,
        userPassword: loginData.userPassword,
        platformID: REMOTE.platformID
      }
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