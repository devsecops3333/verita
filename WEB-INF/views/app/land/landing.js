mainApp.controller('landController', function($scope, $sessionStorage, $state) {
	if ($sessionStorage.UserWidgetsInfo != undefined) {
		$state.go('home');
	}
});