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
      addRepo: addRepo,
      status: status,
      commit: commit,
      fetch: fetch,
      push: push,
      log: log
    }

    function clone(url, path, name) {
      var defer = $q.defer();
      git.clone(url, path, function(response){
        if(!response) {
          defer.resolve(addRepo({'url': url, 'path': path, 'name': name}));
        } else {
          console.log('Error cloning repository');
          defer.resolve({error: response})
        }
      });
      return defer.promise;
    }

    function push(path) {
      var defer = $q.defer();
      var local = require('simple-git')(__dirname + '/'+ path);

      local.push('origin', 'master', function(error, response){
        if(!error) {
          defer.resolve(response);
        } else {
          defer.resolve({error: response})
        }
      });
      return defer.promise;
    }

    function fetch(path) {
      var defer = $q.defer();
      var local = require('simple-git')(__dirname + '/'+ path);

      local.fetch(function(error, response) {
        if(!response) {
          defer.resolve({success: response });
        } else {
          defer.resolve({error: response});
        }
      });
      return defer.promise;
    }

    function commit(path, files, message) {
      var defer = $q.defer();
      var local = require('simple-git')(__dirname + '/'+ path);

      local.commit(message, files, function(error, response) {
        if(!error) {
          defer.resolve({success: response });
        } else {
          defer.resolve({error: error});
        }
      });
      return defer.promise;
    }

    function status(path) {
      var defer = $q.defer();
      var local = require('simple-git')(__dirname + '/' + path);

      local.status(function(error, response) {
        if(!error) {
          defer.resolve({success: response});
        } else {
          defer.resolve({error: response});
        }
      });
      return defer.promise;
    }

    function log(path) {
      var defer = $q.defer();
      var local = require('simple-git')(__dirname + '/'+ path);

      local.log(function(error, response) {
        if(!error) {
          defer.resolve({success: response });
        } else {
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

    function clear() {
      storage.clear(function(error) {
        if (error) throw error;
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
