describe('MapCtrl', function() {

    beforeEach(module('main'));
    var $controller;
    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
    }));

    describe('getPositionSuccess', function() {
        it('successfully gets geolocation from device', function() {
            var $scope = {};
            var controller = $controller('MapCtrl', { $scope: $scope });
            $scope.getPositionSuccess();
            expect($scope.userPosition).not.toBeNull();
        })
    })

    describe('getPositionFailure', function() {
        it('fails to get geolocation from device', function() {
            var $scope = {};
            var controller = $controller('MapCtrl', { $scope: $scope });
            $scope.getPositionFailure();
            expect($scope.userPosition).toEqual($scope.defaultPosition);
        })
    })
});
