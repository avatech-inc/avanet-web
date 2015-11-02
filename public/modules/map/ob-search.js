angular.module('avatech').factory('ObSearch', function (Global) { 

	return function() {

		// defaults

		this.elevationMax = Global.user.settings.elevation == 0 ? 8850 : 8850;

		var defaultPublisher = { orgs: null, outsideOrgs: true, me: true, students: false };
	    this.searchQuery = {
	        days: 365,

	        elev_low: 0,
	        elev_high: this.elevationMax,

	        aspect_low: 0,
	        aspect_high: 359,

	        slope_low: 0,
	        slope_high: 70,

	        text: '',

	        type: {},

	        publisher: angular.copy(defaultPublisher)
	    }

	    this.search_text = function(val) {
	        var needle = this.searchQuery.text.toLowerCase();
	        if (needle.length < 3) return true;

	        // build haystack
	        var haystack = [];

	        if (val.user.fullName) haystack.push(val.user.fullName.toLowerCase());
	        if (val.metaData && val.metaData.location) haystack.push(val.metaData.location.toLowerCase());
	        if (val.organization) haystack.push(val.organization.name.toLowerCase());

	        // search through haystack
	        for (var i = 0; i < haystack.length; i++) {
	            if (haystack[i].length == 0) continue;
	            if (haystack[i].indexOf(needle) != -1) return true;
	        }
	        return false;
	    }

	   this.publisher_isOutsideOrg = function(orgId) {
	        for (var i = 0; i < Global.orgs.length; i++) {
	            if (Global.orgs[i]._id == orgId) return false;
	        }
	        return true;
	    }

	    this.search_publisher = function(val) {
	    	var self = this;
	        var allowed = false;  

	        // my orgs
	        if (self.searchQuery.publisher.orgs) {
	            // if no organization specified, return null
	            if (!val.organization) allowed = false;

	            if (val.organization 
	                && !self.publisher_isOutsideOrg(val.organization._id)
	                && self.searchQuery.publisher.orgs.indexOf(val.organization._id) != -1) allowed = true;
	        } 
	        else if (!self.searchQuery.publisher.orgs) allowed = true;

	        // outside orgs
	        if (!val.organization || (val.organization && self.publisher_isOutsideOrg(val.organization._id))) {
	            allowed = self.searchQuery.publisher.outsideOrgs;
	        }

	        // students
	        if (val.user && val.user.student) {
	            if (allowed === false && self.searchQuery.publisher.students) allowed = true;
	            else if (allowed === true && !self.searchQuery.publisher.students) allowed = false;
	        }

	        // me
	        if (self.searchQuery.publisher.me == null)
	            self.searchQuery.publisher.me = true;

	        if (self.searchQuery.publisher.me != null) {
	            if (val.user._id == Global.user._id) {
	                if (allowed === false && self.searchQuery.publisher.me) allowed = true;
	                else if (allowed === true && !self.searchQuery.publisher.me) allowed = false;
	            }
	        }  

	        return allowed;
	    }

	    this.search_type = function(val) { 
	        return (this.searchQuery.type[val.type]);
	    }

	    this.search_date = function(val) { 
	        var d = new Date();
	        d.setDate(d.getDate() - this.searchQuery.days);

	        if (new Date(val.date) > d) return true;
	        else return false;
	    }

	    this.search_elevation = function(val) { 
	        // if full range is selected, return everything (including profiles without elevation specified)
	        if (this.searchQuery.elev_low == 0 && this.searchQuery.elev_high == this.elevationMax) {
	            return true;
	        }
	        else if ((val.metaData && val.metaData.elevation) || val.elevation) {
	            var elevation;
	            if (val.metaData && val.metaData.elevation) elevation = val.metaData.elevation;
	            else elevation = val.elevation;

	            if (elevation >= this.searchQuery.elev_low &&
	                elevation <= this.searchQuery.elev_high ) return true;
	            else return false;
	        }
	        else return false;
	    }
	    this.search_aspect = function(val) { 
	        // if full range is selected, return everything (including profiles without aspect specified)
	        if (this.searchQuery.aspect_low == 0 && this.searchQuery.aspect_high == 359) {
	            return true;
	        }
	        else if ((val.metaData && val.metaData.aspect) || val.aspect) {
	            var aspect;
	            if (val.metaData && val.metaData.aspect) aspect = val.metaData.aspect;
	            else aspect = val.aspect;
	            
	            if (this.searchQuery.aspect_low > this.searchQuery.aspect_high) {
	                if (aspect >= this.searchQuery.aspect_low ||
	                    aspect <= this.searchQuery.aspect_high ) return true;
	            }
	            else if (aspect >= this.searchQuery.aspect_low &&
	                    aspect <= this.searchQuery.aspect_high ) return true;
	            
	            return false;
	        }
	        else return false;
	    }
	    this.search_slope = function(val) { 
	        // if full range is selected, return everything (including profiles without slope specified)
	        if (this.searchQuery.slope_low == 0 && this.searchQuery.slope_high == 70) {
	            return true;
	        }
	        else if ((val.metaData && val.metaData.slope) || val.slope) {
	            var slope;
	            if (val.metaData && val.metaData.slope) slope = val.metaData.slope;
	            else slope = val.slope;

	            if (slope >= this.searchQuery.slope_low &&
	                slope <= this.searchQuery.slope_high ) return true;
	            else return false;
	        }
	        else return false;
	    }

		this.doSearch = function(profile) {
			var self = this;
	        var ok = true;

	        // only search through published profiles 
	        if (profile.type == 'profile' && !profile.published) return false;

	        if (self.search_type(profile) === false) ok = false;
	        if (self.search_date(profile) === false) ok = false;
	        if (self.search_text(profile) === false) ok = false;
	        if (self.search_publisher(profile) === false) ok = false;
	        if (self.search_elevation(profile) === false) ok = false;
	        if (self.search_aspect(profile) === false) ok = false;
	        if (self.search_slope(profile) === false) ok = false;

	        return ok;
	    }
	    this.publisher_isOrgSelected = function(orgId) {
	        if (!this.searchQuery.publisher.orgs) return true;
	        else return (this.searchQuery.publisher.orgs.indexOf(orgId) != -1);
	    }
	    this.publisher_selectOrg = function(orgId) {
	    	var self = this;
	        // if empty, add all orgs
	        if (!this.searchQuery.publisher.orgs) {
	            this.searchQuery.publisher.orgs = [];
	            angular.forEach(Global.orgs,function(org) { 
	            	self.searchQuery.publisher.orgs.push(org._id) 
	            });
	        }

	        // if not in array, add
	        if (this.searchQuery.publisher.orgs.indexOf(orgId) == -1)
	            this.searchQuery.publisher.orgs.push(orgId);
	        // if already in array, remove
	        else {
	            for (var i = 0; i < this.searchQuery.publisher.orgs.length; i++) {
	                if (this.searchQuery.publisher.orgs[i] == orgId) { 
	                    this.searchQuery.publisher.orgs.splice(i, 1); break;
	                }
	            }
	        }
	    }
	    this.publisher_selectMyOrgs = function() {
	    	var self = this;
	        // if all orgs selected, select none
	        if (this.searchQuery.publisher.orgs == null 
	            || (this.searchQuery.publisher.orgs && this.searchQuery.publisher.orgs.length == Global.orgs.length)) {

	            this.searchQuery.publisher.orgs = [];
	        }
	        // if none selected, add all orgs
	        else {
	            this.searchQuery.publisher.orgs = [];
	            angular.forEach(Global.orgs, function(org) { 
	            	self.searchQuery.publisher.orgs.push(org._id) 
	            });
	        }
	    }
	    this.publisher_selectOutsideOrgs = function() {
	        if (this.searchQuery.publisher.outsideOrgs != null) this.searchQuery.publisher.outsideOrgs = !this.searchQuery.publisher.outsideOrgs;
	        else this.searchQuery.publisher.outsideOrgs = false;
	    }

	    this.publisher_selectMe = function() {
	        if (this.searchQuery.publisher.me != null) this.searchQuery.publisher.me = !this.searchQuery.publisher.me;
	        else this.searchQuery.publisher.me = false;
	    }

	    this.publisher_selectStudents = function() {
	        if (this.searchQuery.publisher.students != null) this.searchQuery.publisher.students = !this.searchQuery.publisher.students;
	        else this.searchQuery.publisher.students = false;
	    }

	    // this.publisher_emptyQuery = function() {
	    //     this.searchQuery.publisher = { outsideOrgs: false, orgs: [], me: false, students: false };
	    // }

	    this.type_select = function(type) {
	        this.searchQuery.type[type] = !this.searchQuery.type[type];
	    }
	    this.clearSearchElevation = function($event) {
	        $event.preventDefault();
	        this.searchQuery.elev_low = 0; 
	        this.searchQuery.elev_high = 9000;
	        return false;
	    }
	    this.clearSearchAspect = function($event) {
	        $event.preventDefault();
	        this.searchQuery.aspect_low = 0;
	        this.searchQuery.aspect_high = 359;
	        return false;
	    }
	    this.clearSearchSlope = function($event) {
	        $event.preventDefault();
	        this.searchQuery.slope_low = 0;
	        this.searchQuery.slope_high = 70;
	        return false;
	    }

        this.isDefaultPublisher = function() {
	        if (!this.searchQuery) return false;

	        var publisher = this.searchQuery.publisher;
	        if (
	            (publisher.orgs == null || publisher.orgs.length == Global.orgs.length) &&
	            (publisher.outsideOrgs == true) &&
	            (publisher.me == true) &&
	            (publisher.students == false)
	            )
	            return true;
	        else return false;
	    }
	    this.setDefaultPublisher = function() {
	        this.searchQuery.publisher = angular.copy(defaultPublisher);
	    }

	}

});