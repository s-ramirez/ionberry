(function() {
    'use strict'

    angular
      .module('app.controllers', ['ngElectron'])
      .controller('MainController', ['$scope', '$rootScope','electron', '$mdDialog', '$mdMedia', 'gitService', MainController])
      .controller('DialogController', ['$scope', '$mdDialog', 'gitService', DialogController]);

    function MainController($scope, $rootScope, electron, $mdDialog, $mdMedia, gitService) {
      var vm = this;
      //listen for host messages

      vm.init = function() {
        gitService.loadRepos().then(function(repos) {
          vm.settings = repos;
        });
      }

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

      vm.init();
    }

    function DialogController($scope, $mdDialog, gitService) {
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.clone = function() {
        $scope.error = false;
        $scope.cloning = true;
        gitService.clone($scope.url, $scope.path).then(function(response) {
          $scope.cloning = false;
          if(response && !response.error) {
            $mdDialog.hide();
          } else {
            $scope.error = response.error;
          }
        });
      };
    }
})();
