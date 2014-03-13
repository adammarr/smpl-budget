var ExportCtrl = function($scope, BudgetService, $modalInstance) {
    
    $scope.name = BudgetService.name;
    $scope.exportJSON = BudgetService.getExport();

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};