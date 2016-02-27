(function() {
  'use strict'

  var nodegit = require('nodegit');

  angular.module('app.services', [])
  .factory('gitService', GitService);

  function GitService() {

  }
})();
