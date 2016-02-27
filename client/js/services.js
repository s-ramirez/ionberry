(function() {
  'use strict'

  const git = require('simple-git')();
  const storage = require('electron-json-storage');

  angular.module('app.services', [])
  .factory('gitService', ['$q', GitService]);

  function GitService($q) {
    var service = {
      clone: clone,
      loadRepos: loadRepos,
      addRepo: addRepo
    }

    function error() {
      return false;
    }

    function clone(url, path) {
      var defer = $q.defer();
      git.clone(url, path, function(response){
        if(!response) {
          defer.resolve(addRepo(path))
        } else {
          console.log('Error cloning repository');
          defer.resolve({error: response})
        }
      });
      return defer.promise;
    }

    function loadRepos() {
      var defer = $q.defer();
      defer.resolve(getSetting('settings'))
      return defer.promise;
    }

    function addRepo(val) {
      return loadRepos().then(function(settings) {
        if(!settings)
          settings = {'repos' : []}
        if(!settings.repos)
          settings.repos = [];

        settings.repos.push(val);
        return setSetting('settings', settings);
      });
    }

    function getSetting(setting) {
      var defer = $q.defer();
      storage.get(setting, function(error, object) {
        if(!error)
          defer.resolve(object)
        else
          defer.resolve(error);
      });
      return defer.promise;
    }

    function setSetting(setting, value) {
      var defer = $q.defer();
      storage.set(setting, value, function(error) {
        (error) ? defer.resolve(error) : defer.resolve(true);
      });
      return defer.promise;
    }
    return service;
  }
})();
