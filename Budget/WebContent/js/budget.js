app.controller('BudgetCtrl', function($scope, BudgetService, $modal, $location, $anchorScroll, $timeout) {
	
	var DAYS_TO_SUB_ANCHOR = 14;
    
    $scope.budget = BudgetService;
    
    $scope.currentDate = moment().startOf('day').unix();
    
    $scope.isPaid = function(idx, date) {
    	var trans = BudgetService.transactions[idx];
    	return !!(trans && trans.p && trans.p[date]);
    };
    
    $scope.getAmount = function(idx, date) {
    	var trans = BudgetService.transactions[idx];
    	if(trans && trans.ac && (trans.ac[date] === 0 || trans.ac[date])) {
    		return trans.ac[date];
    	}
    	return trans.a;
    };
    
    $scope.create = function() {
        var modalInstance = $modal.open({
            templateUrl: 'partials/modal/create.html',
            controller: CreateCtrl
        });
    };
    
    $scope.addTrans = function() {
        var modalInstance = $modal.open({
            templateUrl: 'partials/modal/transaction.html',
            controller: TransactionCtrl
        });
    };
    
    $scope.editTrans = function(idx, date) {
    	var modalInstance = $modal.open({
            templateUrl: 'partials/modal/transactionEdit.html',
            controller: TransactionEditCtrl,
            resolve: {
            	'tidx' : function() {
            		return idx;
            	},
            	'date' : function() {
            		return date;
            	}
            }
        });
    };
    
    $scope.export = function() {
        var modalInstance = $modal.open({
            templateUrl: 'partials/modal/export.html',
            controller: ExportCtrl
        });
    };
    
    $scope.loadSite = function(site) {
        if(site) {
            window.open(site);
        }
    };
    
    $location.hash('b' + moment().startOf('day').subtract('d', DAYS_TO_SUB_ANCHOR).unix());
    $timeout(function() {
    	$anchorScroll();
    });
    
});