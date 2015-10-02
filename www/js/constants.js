angular.module('pie')

.constant('REMOTE', {
	url: "http://localhost:8100/"
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