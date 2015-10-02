angular.module('pie')

.constant('REMOTE', {
	url: "http://piedev-rpmaps.rhcloud.com/servlets/",
	platformID: 2
})

.constant('AUTH_EVENTS', {
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
	admin: 'ADMIN',
	staff: 'STAFF',
	parent: 'PARENT',
	student: 'STUDENT'
});