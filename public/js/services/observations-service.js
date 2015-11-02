angular.module('avatech').service('Observations', [
	'$q', '$rootScope', '$timeout', '$interval', 'Global', '$http',
	function($q, $rootScope, $timeout, $interval, Global, $http) {

	var self=this;

	var lastSync;

	this.observations = [];

	this.init = function() {
		self.sync();
	};

	this.sync = function(callback) {
		$http.get('/v1/all-observations/mine', { params: { last: lastSync } }
        ).success(function(observations) {
            for (var i = 0; i < observations.length; i++) {
            	addOrReplace(observations[i]);
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
        	if (_observation.type == observation.type && _observation._id == observation._id) {
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

	this.save = function(observation) {
		replaceObservation(observation);

        // update on server
        // todo: update!
        // if (observation.type == 'test') {
        // 	$http.post("/v1/tests", observation);
        // }
	};

	this.remove = function(observation) {
         // todo: update!
		// var index = -1;
  //       for (var i = 0; i < self.observations.length; i++) {
  //       	var _observation = self.observations[i];
  //       	if (_observation.type == observation.type && _observation._id == observation._id) {
  //       		index = i;
  //       		break;
  //       	}
  //       }
  //       if (index > -1) self.observations.splice(index, 1);

  //       // update on server
  //       if (observation.type == 'test') {
		// 	observation.removed = true;
  //       	$http.post("/v1/tests", observation);
  //       }
	};
}]);

