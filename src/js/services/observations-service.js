angular.module('avatech').service('Observations', [
    '$q', '$rootScope', '$timeout', '$interval', 'Global', '$http',
    function($q, $rootScope, $timeout, $interval, Global, $http) {

	var self=this;

	var lastSync;

	this.observations = [];

	this.init = function() {
		self.sync();
    $interval(function() { self.sync() }, 60000);
	};

	this.sync = function(callback) {
        // if user not available, don't sync
        if (!Global.user || !Global.user._id) return;
        
        // Restangular.all("users/" + Global.user._id + "/observations")
        // .getList({
        //     verbose: false,
        //     //since: lastSync.toISOString()
        // })
        // .then(function(obs) {
        $http({
            method: 'GET',
            url: window.apiBaseUrl + "users/" + Global.user._id + "/observations",
            responseType: "json",
            params: {
                verbose: false
            }
        })
        .then(function(res) {
          var obs = res.data;

          for (var i = 0; i < obs.length; i++) {
                addOrReplace(obs[i]);
            }
            // keep track of last sync
            lastSync = new Date();
            // callback
            if (callback) callback();
        });
	};

	function replaceObservation(observation) {
        for (var i = 0; i < self.observations.length; i++) {
        	var _observation = self.observations[i];
        	if (_observation._id == observation._id) {
        		self.observations[i] = observation;
        		return true;
        	}
        }
        return false;
	}

	function addOrReplace(observation) {

    	// if observation already exists, replace
    	if (replaceObservation(observation)) return;

    	// doesn't exist, add
		self.observations.push(observation);

    	// todo: removed
	}

	this.save = function(observation, callback) {
		replaceObservation(observation);
    
    // update
    if (observation._id) {
      $http.put(window.apiBaseUrl + "observations/" + observation._id, observation)
      .then(function(res) {
          angular.extend(observation, res.data);
          replaceObservation(observation);
          if (callback) callback(observation);
      });
    }
    // create
    else {
      $http.post(window.apiBaseUrl + "observations", observation)
      .then(function(res) {
          angular.extend(observation, res.data);
          replaceObservation(observation);
          if (callback) callback(observation);
      });
    }
	};

	this.remove = function(observation) {
        // remove from local cache
		    var index = -1;
        for (var i = 0; i < self.observations.length; i++) {
        	var _observation = self.observations[i];
        	if (_observation._id == observation._id) {
        		index = i;
        		break;
        	}
        }
        if (index > -1) self.observations.splice(index, 1);

        // mark as removed on server
        $http.delete(window.apiBaseUrl + "observations/" + observation._id);
	};
}]);

