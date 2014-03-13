var TransactionCtrl = function($scope, BudgetService, $modalInstance) {
    
    $scope.input = {
        trans: '0',
        transType: '0',
        transIntType: '0'
    };
    
    $scope.ok = function () {
        //check errors
        var input = $scope.input;
        if(input.transType === '0') {
            BudgetService.addTransaction({
                d: moment(input.transDate).unix(),
                a: (input.trans === '0') ? -(parseFloat(input.transAmount)) : parseFloat(input.transAmount),
                n: input.transName,
                w: input.transWeb,
                nt: input.transNote
            });
        } else {
            var intv = input.transInt;
            if(input.transIntType === '1') {
                intv *= 7;
            }
            iobj = {
                t: (input.transIntType === '2') ? 2 : 1,
                i: parseInt(intv),
                d: moment(input.transDate).unix(),
                e: (input.transEndDate) ? moment(input.transEndDate).unix() : '',
                a: (input.trans === '0') ? -(parseFloat(input.transAmount)) : parseFloat(input.transAmount),
                n: input.transName,
                w: input.transWeb,
                nt: input.transNote
            };
            if(!input.transEndDate) {
              delete iobj['e'];
            }
            BudgetService.addTransaction(iobj);
        }
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};