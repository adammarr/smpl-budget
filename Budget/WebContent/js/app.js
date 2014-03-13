'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('myApp', [
    'ngRoute',
    'ui.bootstrap',
    'ui.bootstrap.tooltip'
]);

app.config(['$routeProvider', '$locationProvider', '$tooltipProvider', function ($routeProvider, $locationProvider, $tooltipProvider) {
    $routeProvider
        .when('/', {templateUrl: 'partials/budget.html', controller: 'BudgetCtrl'})
        .otherwise({redirectTo: '/'});
    
    $locationProvider.html5Mode(true);
    
    $tooltipProvider.options({
    	popupDelay: 300,
    	appendToBody: true
    });
}]);

app.run(['BudgetService', function(BudgetService) {
    BudgetService.load();
}]);