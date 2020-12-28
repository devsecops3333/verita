mainApp.controller('appController', function($scope, $location, $rootScope,
		$sessionStorage) {

	// $rootScope.themeArray = [ "Default Theme", "Black Theme", "White Theme"
	// ];
	if ($sessionStorage.landTheme === 'black') {
		$rootScope.stylePath = 'style_blacktheme.css';
	} else if ($sessionStorage.landTheme === 'white') {
		$rootScope.stylePath = 'style_whitetheme.css';
	} else {
		$rootScope.stylePath = 'style.css';
	}
	$rootScope.themeArray = [ {
		"id" : "default",
		"name" : "Default Theme"
	}, {
		"id" : "black",
		"name" : "Black Theme"
	}, {
		"id" : "white",
		"name" : "White Theme"
	} ];

});