angular.module('avatech').service('Observations', [
	'$q', '$rootScope', '$timeout', '$interval', '$q', 'Global', '$http',
	function($q, $rootScope, $timeout, $interval, $q, Global, $http) {

	var self=this;

	var lastSync;

	this.observations = [];

	this.init = function() {
		self.sync();
	}

	this.sync = function(callback) {
		$http.get('/v1/profiles/mine', { params: { last: lastSync } }
        ).success(function(observations) {
            for (var i = 0; i < observations.length; i++) {
            	addOrReplace(observations[i]);
            }
            // keep track of last sync
            lastSync = new Date();
            // callback
            if (callback) callback();
        });

	}

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
        if (observation.type == 'test') {
        	$http.post("/v1/tests", observation);
        }
	}
	this.remove = function(observation) {
		var index = -1;
        for (var i = 0; i < self.observations.length; i++) {
        	var _observation = self.observations[i];
        	if (_observation.type == observation.type && _observation._id == observation._id) {
        		index = i;
        		break;
        	}
        }
        if (index > -1) self.observations.splice(index, 1);

        // update on server
        if (observation.type == 'test') {
			observation.removed = true;
        	$http.post("/v1/tests", observation);
        }
	}

	// this._syncToWebInterval;
	// this._syncFromWebInterval;

	// function startSync() {

	// 	if (!Global.user) return;

	// 	var syncInterval = 30000;
	// 	// sync from web
	// 	syncFromWeb();
	// 	self._syncFromWebInterval = $interval(function() { syncFromWeb(); }, 60000);

	// 	// sync to web
	// 	$timeout(function() {	
	// 		syncToWeb();
	// 		self._syncToWebInterval = $interval(function() { syncToWeb(); }, syncInterval);
	// 	}, (syncInterval/2));

	// }

	// function syncFromWeb(callback) {
	// 	return;
	// 	if (!callback) callback = function() {};

	// 	if (!Global.user) return callback();
	// 	// if (!ConnectionMonitor.online) {
	// 	// 	console.log("not connected!");
	// 	// 	return callback();
	// 	// }

	// 	// get last sync
	//     localforage.getItem('lastWebSync', function(err, lastWebSync) { 

	// 		$http.get($rootScope.url + "/v1/tests?last=" + lastWebSync).
	// 		  success(function(profiles, status, headers, config) {

	// 		  	var promises = [];

	// 		  	angular.forEach(profiles,function(profile) {
	// 		  		self.replaceOrAdd(profile);
	// 		  	});

	// 			// keep track of last sync
	//     		localforage.setItem('lastWebSync', new Date().getTime(), function(err) { 

	// 		    });

	// 		  	callback();
	// 		  }).
	// 		  error(function(data, status, headers, config) {
	// 		  	//alert("error!");
	// 		    // called asynchronously if an error occurs
	// 		    // or server returns response with an error status.
	// 	  	});


	//     });

	// }

	// var isSyncing = false;
	// function syncToWeb() {
	// 	return;
	// 	if (isSyncing) return;
	// 	if (!Global.user) return;
	// 	// if (!ConnectionMonitor.online) {
	// 	// 	console.log("not connected!");
	// 	// 	return;
	// 	// }

	// 	isSyncing = true;

	// 	// get all profiles
	// 	localforage.keys(function(err, keys) {
	// 	    // get profile keys
	// 	    var profileKeys = [];
	// 	    for (var i = 0; i < keys.length; i++) {
	// 	    	// is profile?
	// 	    	if (keys[i].indexOf("profile_") == 0) profileKeys.push(localforage.getItem(keys[i]));
	// 	    }
	// 	    // get all profiles
	// 		$q.all(profileKeys).then(function(results) {

	// 			angular.forEach(results,function(profile){

	// 				if (!profile.hash) return;

	// 				// keep track of app version
	// 				profile.appVersion = $rootScope.packageVersion;

	// 				//profile = self.addFuncs(profile);

	// 				if (profile.removed && !profile.removedSynced) {

	// 					// todo: dupliacte?
	// 					$http.post($rootScope.url + "/v1/tests", profile).
	// 					  success(function(data, status, headers, config) {

	// 				    	if (profile.rows) delete profile.rows;

	// 						profile.removedSynced = true;
	// 						//profile.changed = false;
	// 						self.save(profile, false);
	// 					    //profile.$save(false);
	// 					  }).
	// 					  error(function(data, status, headers, config) { });
	// 				}
	// 				else if (profile.changed && !profile.removed) {

	// 					$http.post($rootScope.url + "/v1/tests", profile).
	// 					  success(function(data, status, headers, config) {

	// 					    if (profile.rows) delete profile.rows;

	// 						//profile.neverSynced = false;
	// 					    //profile.changed = false;
	// 					    self.save(profile, false);
	// 					    //profile.$save(false);
	// 					  }).
	// 					  error(function(data, status, headers, config) {
	// 					  	//alert("error!");
	// 					    // called asynchronously if an error occurs
	// 					    // or server returns response with an error status.
	// 					  });
	// 				}
	// 			});

	// 			// todo: make timeout? or use promises to know when sync is complete?
	// 			isSyncing = false;

	// 		});
	// 	});
	// }

	// this._profiles = null;

	// this.getAll = function(callback) {
	// 	// if local profiles isn't null, return that
	// 	if (self._profiles != null) return callback(self._profiles);

	// 	// otherwise, get from localforage
	// 	localforage.keys(function(err, keys) {

	// 	    // get profile keys
	// 	    var profileKeys = [];
	// 	    for (var i = 0; i < keys.length; i++) {
	// 	    	// is profile?
	// 	    	if (keys[i].indexOf("profile_") == 0) profileKeys.push(localforage.getItem(keys[i]));
	// 	    }

	// 		$q.all(profileKeys).then(function(results) {
	// 			var profiles = [];

	//     		// if marked as removed, treat as if it doesn't exist and don't return to user
	// 			angular.forEach(results,function(result){
	// 				if (!result.removed) profiles.push(result);
	// 			});

	// 			// add helper functions
	// 			// for(var i = 0; i < profiles.length; i++) {
	// 			// 	profiles[i] = self.addFuncs(profiles[i]);
	// 			// }

	// 			self._profiles = profiles;
	// 		    callback(self._profiles);
	// 		});
	// 	});
	// }

	// this.getAllIncludingRemoved = function(callback) {
	// 	localforage.keys(function(err, keys) {

	// 	    // get profile keys
	// 	    var profileKeys = [];
	// 	    for (var i = 0; i < keys.length; i++) {
	// 	    	// is profile?
	// 	    	if (keys[i].indexOf("profile_") == 0) profileKeys.push(localforage.getItem(keys[i]));
	// 	    }

	// 	    if (profileKeys.length == 0) return callback([]);

	// 		$q.all(profileKeys).then(function(profiles) {
	// 		    callback(profiles);
	// 		});
	// 	});
	// }

	// this.saveInStorage = function(_profile) {
	// 	var _profile = angular.copy(_profile);
	// 	delete _profile.$save;
	// 	delete _profile.$remove;
	// 	localforage.setItem('profile_' + _profile.hash, _profile, function(err) { 
	// 		//alert(err);
	//     });
	// }
	// this.saveInArray = function(_profile) {
	// 	for (var i = 0; i < self._profiles.length;i++) {
	// 		if (_profile.hash == self._profiles[i].hash) { self._profiles[i] = _profile; break; }
	// 	}
	// }

	// this.save = function(_profile, changed) {

	// 	if (changed == null) changed = true;
	// 	_profile.changed = changed;

	// 	self.saveInArray(_profile);
	// 	self.saveInStorage(_profile);

	// 	// sync
	//     //if (changed) syncToWeb();
	// }
	// this.remove = function(_profile) {
	// 	// mark as removed
	// 	_profile.removed = true;
	// 	_profile.removedSynced = false;

	// 	_profile.changed = false;
	// 	// remove the big stuff
	// 	_profile.metaData = null;
	// 	_profile.rows = [];
	// 	_profile.rows_compressed = [];
	// 	_profile.rows_small = [];

	// 	// delete from array
	// 	var index = -1;
	// 	for (var i = 0; i < self._profiles.length;i++) {
	// 		if (_profile.hash == self._profiles[i].hash) { index = i; break; }
	// 	}
	// 	if (index > -1) self._profiles.splice(index, 1);

	// 	// save in storage, marked as removed
	// 	self.saveInStorage(_profile);
	// }

	// this.get = function(profileHash, callback) {

	// 	// first try to get from array
	// 	for (var i = 0; i < self._profiles.length;i++) {
	// 		if (profileHash == self._profiles[i].hash) { 
	// 			//var profile = self.addFuncs(self._profiles[i]);
	// 			return callback(self._profiles[i]); 
	// 		}
	// 	}

	// 	// otherwise, try getting from localforage
	//     localforage.getItem('profile_' + profileHash, function(err, profile) { 

	//     	if (!profile) return callback(null);

	//     	// if marked as removed, treat as if it doesn't exist and return null
	//     	if (profile.removed) return callback(null);

	//     	//profile = self.addFuncs(profile);

 //  			callback(profile);
	//     });
	// }

	// this.replaceOrAdd = function(profile) {
	// 	//profile = self.addFuncs(profile);

	// 	// exists?
	//     localforage.getItem('profile_' + profile.hash, function(err, _profile) { 
	//     	// alert("exists?")
	//     	// alert(err);
	//     	// alert(_profile);


	// 		// if profile exists...

	// 		//if removed locally, ignore (this will sync eventually in syncToWeb)
	// 		if (_profile && _profile.removed) return;

	// 		// if exists and not removed (and not changed), replace
	// 		if (_profile) {
	// 			if (!_profile.changed) self.replace(profile);
	// 		}
	// 		// if doesn't exist, add it
	// 		else self.add(profile, false);

	// 	});
	// }

	// this.replace = function(profile) {
	// 	profile.changed = false;

	// 	self.saveInStorage(profile);
	// 	self.saveInArray(profile);
	// }

	// this.add = function(profile, changed) {
	// 	if (changed == null) changed = true;
		
	// 	//profile.neverSynced = changed;
	// 	profile.changed = changed;

	// 	//alert(JSON.stringify(profile));
	// 	//var _profile = deepCopy(angular.copy(profile));
	// 	//alert(JSON.stringify(_profile) == JSON.stringify(profile));
	// 	//alert('profile_' + profile.hash);
	// 	// var _profile = JSON.parse(JSON.stringify(profile));

	// 	// alert("same? " + (JSON.stringify(profile) == JSON.stringify(_profile)));
	// 	// alert(Object.keys(profile));

	// 	self.saveInStorage(profile);

	//     // don't add if removed
	// 	if (profile.removed) {
	// 		profile.removedSynced = true;
	// 		profile.changed = false;
	// 		// todo: local removed array?
	// 		return;
	// 	}

	// 	// add to local list
	// 	self._profiles.push(profile);

	// 	// sync
	//     //syncToWeb();
	// }

	// this.init = function(callback) {
	// 	self.getAll(function(profiles) {
	// 		startSync();
	// 		callback();
	// 	});
	// }
	// // this.stop = function() {
	// // 	if (self._syncToWebInterval) $interval.cancel(self._syncToWebInterval);
	// // 	if (self._syncFromWebInterval) ;$interval.cancel(self._syncFromWebInterval);
	// // 	self._profiles = null;
	// // }

}]);

