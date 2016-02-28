(function() {
    'use strict'

    angular
      .module('app.controllers', ['ngElectron'])
      .controller('MainController', ['$scope', '$rootScope', '$location', 'electron', '$mdDialog', '$mdMedia', '$mdSidenav', 'gitService', MainController])
      .controller('DialogController', ['$scope', '$mdDialog', 'gitService', DialogController])
      .controller('RepoController', ['$rootScope', '$location', '$routeParams', 'gitService', RepoController])
      .controller('CommitController', ['$scope','$rootScope', '$routeParams', '$location', '$mdDialog', 'dragularService','gitService', CommitController]);

    // Main controller
    function MainController($scope, $rootScope, $location, electron, $mdDialog, $mdMedia, $mdSidenav, gitService) {
      var vm = this;
      //listen for host messages

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
    function RepoController($rootScope, $location, $routeParams, gitService) {
      var vm = this;

      vm.selected = [];

      vm.repo = {
        name: $routeParams.name,
        path: $routeParams.path,
        url: $routeParams.url
      };

      vm.init = function () {
        vm.loading = true;
        gitService.log(vm.repo.path).then(function(results) {
          if(!results.error)
            vm.commits = results.success.all;
          vm.loading = false;
        });
        vm.refresh();
      }

      vm.openCommit = function () {
        $location.path('/commit/').search(vm.repo);
      }

      vm.refresh = function (ev) {
        gitService.status(vm.repo.path).then(function(results) {
          if(!results.error) {
            vm.status = results.success;

            vm.ahead = results.success.ahead;
            vm.behind = results.success.behind;

            vm.changes = 0;
            vm.changes += vm.status.conflicted.length;
            vm.changes += vm.status.created.length;
            vm.changes += vm.status.deleted.length;
            vm.changes += vm.status.modified.length;
            vm.changes += vm.status.not_added.length;
          }
        });
      }

      vm.push = function () {
        vm.loading = true;
        gitService.push(vm.repo.path).then(function(results) {
          if(!results.error) {
            vm.refresh();
            vm.pushing = false;
          }
        });
      }

      vm.pull = function () {
        vm.loading = true;
        gitService.pull(vm.repo.path).then(function(results) {
          if(!results.error) {
            vm.refresh();
            vm.loading = false;
          }
        });
      }

      vm.query = {
        order: 'date',
      };

      vm.init();
    }

    function CommitController($scope, $rootScope, $routeParams, $location, $mdDialog, dragularService, gitService) {
      var vm = this;
      vm.staged = [];
      vm.changedFiles = [];

      vm.init = function () {
        vm.getStatus();
      };
      function dragger(el, target, source, sibling) {
        if(el.parentNode != target) {
          for(var i = 0; i < vm.changedFiles.length; i++) {
            if(vm.changedFiles[i].file == el.id) {
              vm.staged.push(angular.copy(vm.changedFiles[i]));
              vm.changedFiles.splice(i, 1);
              return true;
            }
          }
          for(var i = 0; i < vm.staged.length; i++) {
            if(vm.staged[i].file == el.id) {
              vm.changedFiles.push(angular.copy(vm.staged[i]));
              vm.staged.splice(i, 1);
              return true;
            }
          }
        }
      }

      $scope.$on('dragulardrop', function(e) {
        for(var i = 0; i < vm.staged.length; i++) {
          if(!vm.staged[i]) {
            vm.staged.splice(i,1);
          }
        }
        for(var i = 0; i < vm.changedFiles.length; i++) {
          if(!vm.changedFiles[i]) {
            vm.changedFiles.splice(i,1);
          }
        }
        e.preventDefault();
      });

      $scope.$on('dragulardragend', function(e) {
        e.preventDefault();
      });

      vm.dragularOptions = {
        scope: $scope,
        containersModel: vm.changedFiles,
        accepts: dragger,
        nameSpace: 'common'
      };

      vm.dragularOptions2 = {
        scope: $scope,
        containersModel: vm.staged,
        accepts: dragger,
        nameSpace: 'common'
      };

      vm.repo = {
        name: $routeParams.name,
        path: $routeParams.path,
        url: $routeParams.url
      };

      vm.commit = function() {
        var files = [];
        vm.loading = true;

        for(var i = 0; i < vm.staged.length; i++) {
          files.push(vm.staged[i].file);
        }

        gitService.commit(vm.repo.path, files, vm.message).then(function(response) {
          if(response.success) {
            $mdDialog.show(
              $mdDialog.alert()
              .parent(angular.element(document.querySelector('#commit-container')))
              .clickOutsideToClose(true)
              .title('Committed succesfully!')
              .textContent('Commit: '+response.success.commit + "( changes: " + response.success.changes + ", deletions: " + response.success.deletions + ", insertions: " + response.success.insertions + " )")
              .ok('Awesome!')
            );
          }
          vm.loading = false;
        });
      }

      vm.getIcon = function(icon) {
        if(icon == "modified")
          return "mode_edit";
        else if(icon == "added")
          return "plus";
      }

      vm.getStatus = function () {
        gitService.status(vm.repo.path).then(function(results) {
          if(!results.error) {
            vm.status = results.success;
            vm.changedFiles = [];
            for(var key in vm.status) {
              if(typeof vm.status[key] !== 'string') {
                for(var i = 0; vm.status[key] && i < vm.status[key].length; i++) {
                  vm.changedFiles.push({
                    type: key,
                    file: vm.status[key][i]
                  });
                }
              }
            }
          }
        });
      }

      vm.navigateTo = function(url) {
        $location.path(url);
      }

      vm.init();
    }
})();
