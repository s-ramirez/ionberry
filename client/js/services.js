(function() {
  'use strict'

  var git = require('simple-git')();

  angular.module('app.services', [])
  .factory('gitService', GitService);

  function GitService() {
    var service = {
      clone: clone,
    }

    function error() {
      console.log("Nope");
      return false;
    }

    function clone(url, path) {
      git.clone(url, path, error)
    }
    return service;
  }
})();
