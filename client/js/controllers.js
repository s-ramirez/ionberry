(function() {
    'use strict'

    angular
      .module('app.controllers', ['ngElectron'])
      .controller('MainController', ['$scope', '$rootScope', '$location', 'electron', '$mdDialog', '$mdMedia', '$mdSidenav', 'gitService', MainController])
      .controller('DialogController', ['$scope', '$mdDialog', 'gitService', DialogController])
      .controller('RepoController', ['$rootScope', '$routeParams','gitService', RepoController]);

    // Main controller
    function MainController($scope, $rootScope, $location, electron, $mdDialog, $mdMedia, $mdSidenav, gitService) {
      var vm = this;
      //listen for host messages
      $rootScope.title = "Repositories";
      $rootScope.options = 0;

      vm.user = {
        name: 's-ramirez',
        lvl: 10,
        exp: 80
      }

      vm.init = function() {
        gitService.loadRepos().then(function(repos) {
          vm.settings = repos;
        });
      }

      vm.randomImage = function(){
        var random = Math.floor(Math.random() * (5 - 1)) + 1;
        return 'client/img/octo.'+random+'.png';
      }

      vm.toggleSidenav = function() {
        $mdSidenav('left').toggle();
      }

      vm.navigateTo = function(url) {
        $location.path(url);
        $mdSidenav('left').toggle();
      }

      vm.openRepo = function(repo) {
        $location.path('/repo/').search(repo);
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

    // Dialog Controller
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
        gitService.clone($scope.url, $scope.path, $scope.name).then(function(response) {
          $scope.cloning = false;
          if(response && !response.error) {
            $mdDialog.hide();
          } else {
            $scope.error = response.error;
          }
        });
      };
    }

    // Repo Controller
    function RepoController($rootScope, $routeParams, gitService) {
      var vm = this;

      vm.selected = [];

      vm.repo = {
        name: $routeParams.name,
        path: $routeParams.path,
        url: $routeParams.url
      };

      $rootScope.title = vm.repo.name;
      $rootScope.options = 1;

      vm.init = function () {
        vm.loading = true;
        gitService.log(vm.repo.path).then(function(results) {
          if(!results.error)
            vm.commits = results.success.all;
          vm.loading = false;
        });
        vm.refresh();
      }

      vm.refresh = function (ev) {
        gitService.status(vm.repo.path).then(function(results) {
          if(!results.error) {
            vm.status = results.success;

            vm.changes = 0;
            vm.changes += vm.status.conflicted.length;
            vm.changes += vm.status.created.length;
            vm.changes += vm.status.deleted.length;
            vm.changes += vm.status.modified.length;
            vm.changes += vm.status.not_added.length;
          }
        });
      }

      vm.query = {
        order: 'date',
      };

      vm.init();
    }
})();
