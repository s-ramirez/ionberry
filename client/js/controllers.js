(function() {
    'use strict'

    angular
      .module('app.controllers', ['ngElectron'])
      .controller('MainController', ['$scope', '$rootScope','electron', '$mdDialog', '$mdMedia', MainController])
      .controller('DialogController', ['$scope', '$mdDialog', 'gitService', DialogController]);

    function MainController($scope, $rootScope, electron, $mdDialog, $mdMedia) {
      var vm = this;
      //listen for host messages

      $rootScope.$on('electron-host', function( evt, data ) {
        console.log( data );
      });

      //Click face handler
      vm.clone = function() {

      }
      vm.cloneDialog = function(ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
          controller: DialogController,
          templateUrl: 'client/tpl/clone.dialog.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: useFullScreen
        })
        .then(function(answer) {
          vm.message = "answer"
        }, function() {
          vm.message = 'nil';
        });
        $scope.$watch(function() {
          return $mdMedia('xs') || $mdMedia('sm');
        }, function(wantsFullScreen) {
          $scope.customFullscreen = (wantsFullScreen === true);
        });
      };
    }

    function DialogController($scope, $mdDialog, gitService) {
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.clone = function() {
        $mdDialog.hide();
        gitService.clone($scope.url, $scope.path)
      };
    }
})();
