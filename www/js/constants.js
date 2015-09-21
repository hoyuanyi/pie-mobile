angular.module('pie')

.constant('REMOTE', {
	url: "http://localhost:8100/"
})

.constant('AUTH_EVENTS', {
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
	admin: 'admin_role',
	teacher: 'teacher_role',
	parent: 'parent_role',
	student: 'student_role'
});