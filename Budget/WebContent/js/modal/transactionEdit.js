var TransactionEditCtrl = function($scope, BudgetService, $modalInstance, tidx, date) {
	
	var trans = BudgetService.transactions[tidx],
		hasAC = (trans.ac && (trans.ac[date] === 0 || !!trans.ac[date])),
		amount;
	
	if(hasAC) {
		amount = trans.ac[date];
	}
    
    $scope.input = {
        transName: trans.n,
        transAmount: Math.abs(amount || trans.a),
        transAmountOld: Math.abs(amount || trans.a),
        transInt: trans.i,
        transCalc: (trans.cl === undefined || !!trans.cl),
        transIntType: trans.t,
        transDate: moment.unix(trans.d).format('MM/DD/YYYY'),
        transEndDate: moment.unix(trans.e).format('MM/DD/YYYY'),
        transEndDateOld: moment.unix(trans.e).format('MM/DD/YYYY'),
        currentDate: moment().format('MM/DD/YYYY'),
        transWeb: trans.w,
        isDebit: trans.a < 0,
        isPaid: !!(trans.p && trans.p[date])
    };
    
    $scope.paid = function () {
        if($scope.input.isPaid) {
        	trans.p[date] = false;
        } else {
        	if(!trans.p) {
        		trans.p = {};
        	}
        	trans.p[date] = true;
        }
        BudgetService.refresh();
        $modalInstance.close();
    };
    
    $scope.update = function () {
    	//TODO error check
    	if(!trans.ac) {
    		trans.ac = {};
    	}
    	trans.ac[date] = ($scope.input.isDebit) ? -parseFloat($scope.input.transAmount) : parseFloat($scope.input.transAmount);
    	BudgetService.refresh();
        $modalInstance.close();
    };
    
    $scope.toggleCalc = function() {
    	if(trans.cl === undefined) {
    		trans.cl = false;
    	} else {
    		trans.cl = !trans.cl;
    	}
    	BudgetService.refresh();
        $modalInstance.close();
    };
    
    $scope.updateFuture = function () {
        //check errors
        $modalInstance.close();
    };
    
    $scope.updateEnd = function () {
        //check errors
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.loadSite = function(site) {
        if(site) {
            window.open(site);
        }
    };
};