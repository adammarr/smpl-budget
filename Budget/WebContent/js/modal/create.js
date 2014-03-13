var CreateCtrl = function($scope, BudgetService, $modalInstance) {
    
    $scope.input = {};
    
    $scope.ok = function () {
        BudgetService.create($scope.input.budgetName, parseFloat($scope.input.startAmount));
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};