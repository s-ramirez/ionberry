angular.module('app.routes', [])
.config(['$routeProvider',
function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: "client/tpl/main.html"
  })
  .when('/repo', {
    templateUrl: "client/tpl/repo.html",
    controller: "RepoController",
    controllerAs: "repo"
  })
  .when('/commit', {
    templateUrl: "client/tpl/commit.html",
    controller: "CommitController",
    controllerAs: "commit"
  })
  .otherwise('/');
}]);
