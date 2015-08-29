var mongoose = require('mongoose'),
    Async = require('async'),
    Profile = mongoose.model('Profile'),
    Test = mongoose.model('Test'),
    Observation = mongoose.model('Observation'),
    Organization = mongoose.model('Organization'),
    _ = require('underscore');

// -----------------------------------------------------------------

var util = require('util');

exports.create = function(req, res) {
    // remove forbidden fields
    delete req.body.user;
    delete req.body._id;

    var profile = new Profile(req.body);

    //console.log(profile);

    profile.user = req.user;
    console.log(profile);
    profile.save();
    res.jsonp(profile);
};

exports.update = function(req, res) {
    // var profile = req.profile;

    // profile = _.extend(profile, req.body);

    // profile.save(function(err) {
    //     res.jsonp(profile);
    // });




    // if not admin
    // if (!req.user.admin) {
    //     // user can only update themself - todo: maybe return 401/403?
    //     if (req.user._id != req.body._id) return res.json({});
    //     // remove forbidden fields
    //     delete req.body.admin;
    //     delete req.body.disabled;
    // }
    // remove forbidden fields
    //delete req.body.hashed_password;
    // delete req.body.salt;
    // delete req.body.username;
    // delete req.body.email;

    // remove forbidden fields
    delete req.body.user;
    delete req.body._id;

    // normalize sharedOrganizations
    if (req.body.sharedOrganizations && req.body.sharedOrganizations.length > 0) {
        var sharedOrganizations = [];
        for(var i = 0; i < req.body.sharedOrganizations.length; i++)
            sharedOrganizations.push(req.body.sharedOrganizations[i]._id);
        req.body.sharedOrganizations = sharedOrganizations;
    }

    // mark updated
    req.body.updated = new Date();

    // update
    Profile.findOneAndUpdate({ _id: req.params.profileId }, req.body, { select: '-user' }, function(err, profile) {
        if (err) console.log(err);
        if (profile) res.json(profile);
        else res.json({});
    });
};

exports.destroy = function(req, res, next) {
    var id = req.params.profileId;

    Profile.load(id, function(err, profile) {
        if (err) return next(err);
        if (!profile) return next(new Error('Failed to load profile ' + id));

        profile.remove(function(err) {
            if (err) {
                res.render('error', { status: 500 });
            } else {
                res.json({ success: true });
            }
        });
    });
};

exports.show = function(req, res, next) {
    var id = req.params.profileId;

    Profile.load(id, function(err, profile) {
        if (!profile) return next(err);
        if (err) return next(err);

        console.log(profile.user);
        console.log(req.user);

        // todo: this is where permissions stuff will go
        var allowed = true;

        // only allow if user created it
        if (!profile.user._id.equals(req.user._id)) {
            allowed = false;
        }

        // or if in organization user has access to
        if (profile.published && profile.sharingLevel == 'org') {
            // todo: make sure actually in user's orgs
            allowed = true;
        }

        // if shared with user directly, allow
        // todo...

        // if all pros
        if (profile.published && profile.sharingLevel == 'pros') {
            allowed = true;
        }

        // if student profile, free for anyone to see
        if (profile.published && profile.sharingLevel == 'student') {
            allowed = true;
        }

        // if admin, allow
        if (req.user.admin) allowed = true;

        if (!allowed) {
            return res.json({ error: "Profile not found" });
        }

        if (!profile) return next(new Error('Failed to load profile ' + id));
        res.json(profile);
    });
};


exports.allMine = function(req, res) {

    var query = { user: req.user, removed: { "$ne": true } };

    Async.parallel([

        // SP1 profiles
        function(callback) {

            var query2 = util._extend({}, query);
            query2.version = 'v1';

            Test.find(query2)
            .select('type organization created updated location date user location elevation aspect slope rows_micro published sharingLevel') 
            .populate('user', 'fullName student')
            .populate('organization','name type logoUrl')
            .lean()
            .exec(function(err, obs) {
                if (err) callback(err);
                callback(null, obs);
            });
        },

        // manual profiles
        function(callback) {

            Profile.find(query)
            .select('type organization created updated location date time depth published sharingLevel layers.depth layers.hardness2 layers.hardness layers.height user metaData.location metaData.elevation metaData.date metaData.time metaData.aspect metaData.slope') 
            .populate('user', 'fullName student')
            .populate('organization','name type logoUrl')
            .lean()
            .exec(function(err, obs) {
                if (err) callback(err);
                else callback(null, obs);
            });
        },

        // avalanches
        function(callback) {

            Observation.find(query)
            .select('type organization created updated location date time locationName user elevation aspect photos slope published sharingLevel') 
            .populate('user', 'fullName')
            .populate('organization','name type logoUrl')
            .lean()
            .exec(function(err, obs) {
                if (err) callback(err);
                else callback(null, obs);
            });
        }
    ],
    function(err, results) {

        var _results = [];
        // combine
        _results = _results.concat(results[0]);
        _results = _results.concat(results[1]);
        _results = _results.concat(results[2]);

        if (err) res.render('error', { status: 500 });
        else res.json(_results);
    });
}

exports.all = function(req, res) {

    var verbose = req.query.verbose === 'true';
    verbose = false;

    
    var e = new Date().getTime();

    // get user's organizations
    // (for students, get all edu orgs)
    var orgQuery = { members: { '$elemMatch': { user: req.user._id } } };
    if (req.user.student === true) orgQuery = { type: 'Avalanche education' };

    Organization.find(orgQuery)
    .select('_id')
    .lean()
    .exec(function(err, orgs) {
        var _orgs = []; for (var i = 0; i < orgs.length; i++)  _orgs.push(orgs[i]._id);

        console.log("TIME -: " + (new Date().getTime() - e) + " ms");

        // Build Query
        var query = {};

        // "OR" QUERIES
        var queries = [];

        // if a student
        if (req.user.student === true) {

            // if published by a student
            queries.push({ published: true, sharingLevel: 'student' });

            // if shared with educational orgs
            // (for students, the _orgs variable is all education orgs)
            queries.push({ published: true, sharedOrganizations: { '$in': _orgs }, sharingLevel: 'org' });

            // if 'share with students' is selected
            queries.push({ published: true, sharingLevel: 'pros', shareWithStudents: true });

        }
        // if not a student
        else {
            // always show user's own data (no drafts)
            queries.push({ published: true, user: req.user });

            // orgs
            queries.push({ published: true, sharedOrganizations: { '$in': _orgs }, sharingLevel: 'org' });

            // all pros
            queries.push({ published: true, sharingLevel: 'pros' });

            // all student profiles are allowed
            queries.push({ published: true, sharingLevel: 'student' });
        }

        // combine all "or" queries
        query['$or'] = queries;

        // if andrew, see everything
        if (req.user._id == "52e48c646082d09157000002" ||
            req.user._id == "54e156c08e3b90bcf89fb6b3") {
            query = { published: true };
        }

        // "AND" QUERIES
        var andQueries = [];

        // search only within specified lat/lng map bounds
        if (req.query.nelat && req.query.nelng && req.query.swlat && req.query.swlng) {

            andQueries.push({ location: { '$geoWithin': {
                '$box': [
                  [req.query.swlng, req.query.swlat], [req.query.nelng, req.query.nelat]
                ]
            }}});
        }

        // combine "and" queries
        query['$and'] = andQueries;

        // get data asynchronously
        Async.parallel([

            // SP1 profiles
            function(callback) {
                var d = new Date().getTime();

                var query2 = util._extend({}, query);
                // todo: this is NOT a deep copy!!!! fix! (i.e., version is applied to all queries, not just sp1)
                query2['$and'].push({ removed: { "$ne": true } }); //version: 'v1', 

                // var verboseFields = "";
                // if (verbose) {
                    verboseFields = "rows_micro";
                //}

                Test.find(query2)
                .select('type location organization created updated date user published elevation aspect slope ' + verboseFields) 
                .populate('user', 'fullName student')
                .populate('organization','name type') // logoUrl
                .lean()
                .exec(function(err, obs) {
                    console.log("TIME S: " + (new Date().getTime() - d) + " ms");
                    if (err) callback(err);
                    callback(null, obs);
                });
            },

            // manual profiles
            function(callback) {
                var d = new Date().getTime();

                //var verboseFields = "";
                //if (verbose) {
                    verboseFields = "layers.depth layers.hardness2 layers.hardness layers.height";
                //}

                Profile.find(query)
                .select('type location organization created updated date time depth published sharingLevel  user metaData.location metaData.elevation metaData.date metaData.time metaData.aspect metaData.slope ' + verboseFields) 
                .populate('user', 'fullName student')
                .populate('organization','name type') //logoUrl
                .lean()
                .exec(function(err, obs) {
                    console.log("TIME M: " + (new Date().getTime() - d) + " ms");
                    if (err) callback(err);
                    else callback(null, obs);
                });
            },

            // avalanches
            function(callback) {
                var d = new Date().getTime();

                var verboseFields = "";
                // if (verbose) {
                //     verboseFields = "";
                // }

                Observation.find(query)
                .select('type location organization created updated date time published locationName user elevation aspect slope photos ' + verboseFields) 
                .populate('user', 'fullName')
                .populate('organization','name type') //logoUrl
                .lean()
                .exec(function(err, obs) {
                    console.log("TIME A: " + (new Date().getTime() - d) + " ms");
                    if (err) callback(err);
                    else callback(null, obs);
                });
            }
        ],
        function(err, results) {

            var _results = [];
            // combine SP1 profiles 
            _results = _results.concat(results[0]);
            // combine manual profiles - published
            _results = _results.concat(results[1]);
            // combine avalanches
            _results = _results.concat(results[2]);

            console.log("TOTAL ITEMS: " + _results.length);

            if (err) res.render('error', { status: 500 });
            else res.json(_results);
        });
    
    });
};