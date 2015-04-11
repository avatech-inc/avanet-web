var mongoose = require('mongoose'),
    Async = require('async'),
    Test = mongoose.model('Test'),
    Observation = mongoose.model('Observation'),
    Organization = mongoose.model('Organization'),
    _ = require('underscore');

exports.create = function(req, res) {
    // remove forbidden fields
    delete req.body.user;
    delete req.body._id;

    // sharedOrganizations
    if (req.body.sharedOrganizations && req.body.sharedOrganizations.length > 0) {
        var sharedOrganizations = [];
        for(var i = 0; i < req.body.sharedOrganizations.length; i++)
            sharedOrganizations.push(req.body.sharedOrganizations[i]._id);
        req.body.sharedOrganizations = sharedOrganizations;
    }

    var observation = new Observation(req.body);

    observation.user = req.user;
    console.log(observation);
    observation.save();
    res.jsonp(observation);
};

exports.update = function(req, res) {
    // remove forbidden fields
    delete req.body.user;
    delete req.body._id;

    // sharedOrganizations
    if (req.body.sharedOrganizations && req.body.sharedOrganizations.length > 0) {
        var sharedOrganizations = [];
        for(var i = 0; i < req.body.sharedOrganizations.length; i++)
            sharedOrganizations.push(req.body.sharedOrganizations[i]._id);
        req.body.sharedOrganizations = sharedOrganizations;
    }

    // mark updated
    req.body.updated = new Date();

    // update
    Observation.findOneAndUpdate({ _id: req.params.observationId }, req.body, { select: '-user' }, function(err, observation) {
        if (err) console.log(err);
        if (observation) res.json(observation);
        else res.json({});
    });
};


// exports.update = function(req, res) {
//     // remove forbidden fields
//     delete req.body.user;
//     delete req.body._id;

//     // sharedOrganizations
//     if (req.body.sharedOrganizations && req.body.sharedOrganizations.length > 0) {
//         var sharedOrganizations = [];
//         for(var i = 0; i < req.body.sharedOrganizations.length; i++)
//             sharedOrganizations.push(req.body.sharedOrganizations[i]._id);
//         req.body.sharedOrganizations = sharedOrganizations;
//     }

//     // mark updated
//     req.body.updated = new Date();

//     // update
//     Observation.findOneAndUpdate({ _id: req.params.profileId }, req.body, { select: '-user' }, function(err, profile) {
//         if (err) console.log(err);
//         if (profile) res.json(profile);
//         else res.json({});
//     });
// };

// exports.destroy = function(req, res, next) {
//     var id = req.params.profileId;

//     Profile.load(id, function(err, profile) {
//         if (err) return next(err);
//         if (!profile) return next(new Error('Failed to load profile ' + id));

//         profile.remove(function(err) {
//             if (err) {
//                 res.render('error', { status: 500 });
//             } else {
//                 res.json({ success: true });
//             }
//         });
//     });
// };

// exports.show = function(req, res, next) {
//     var id = req.params.profileId;

//     Profile.load(id, function(err, profile) {
//         if (err) return next(err);

//         console.log(profile.user);
//         console.log(req.user);

//         // todo: this is where permissions stuff will go
//         var allowed = true;

//         // only allow if user created it
//         if (!profile.user._id.equals(req.user._id)) {
//             allowed = false;
//         }

//         // or if in organization user has access to
//         if (profile.published && profile.sharingLevel == 'org') {
//             // todo: make sure actually in user's orgs
//             allowed = true;
//         }

//         // if shared with user directly, allow
//         // todo...

//         // if all pros
//         if (profile.published && profile.sharingLevel == 'pros') {
//             allowed = true;
//         }

//         // if admin, allow
//         if (req.user.admin) allowed = true;

//         if (!allowed) {
//             return res.json({ error: "Profile not found" });
//         }

//         if (!profile) return next(new Error('Failed to load profile ' + id));
//         res.json(profile);
//     });
// };

exports.all = function(req, res) {

    Organization.find({}).exec(function(err, orgs) {
        var _orgs = [];
        for (var i = 0; i < orgs.length; i++) {
            // is user a member
            for (var m = 0; m < orgs[i].members.length; m++) {
                if (orgs[i].members[m].user.equals(req.user._id))
                    _orgs.push(orgs[i]._id);
            }
        }

        // build query  
        var queries = [];

        // normal user, only their own data (no drafts)
        queries.push({ published: true, user: req.user });

        // orgs
        //queries.push({ user: { '$in': orgUsers }, published: true, sharingLevel: 'org' });
        queries.push({  published: true, sharedOrganizations: { '$in': _orgs }, sharingLevel: 'org' });

        // all pros
        queries.push({ published: true, sharingLevel: 'pros' });

        // all queries are OR
        var query = { '$or': queries };

        // if andrew, see everything
        if (req.user._id == "52e48c646082d09157000002") {
            query = { published: true };
        }

        // bounds
        // if (req.query.nelat && req.query.nelng && req.query.swlat && req.query.swlng) {

        //     query['$and'] = [{ location: { '$geoWithin': {
        //         '$box': [
        //           [req.query.swlng, req.query.swlat], [req.query.nelng, req.query.nelat]
        //         ]
        //     }}}];
        // }


        Observation.find(query)
        //.select('type organization created updated location date user metaData.location metaData.elevation metaData.aspect metaData.slope rows_small') 
        .sort('-date')
        .populate('user', 'fullName')
        .populate('organization','name')
        //.lean()
        .exec(function(err, obs) {
            if (err) {
                //res.render('error', { status: 500 });
                callback(err);
            } else {
                //res.json([]);

                res.json(obs);
                //for(var i = 0; i < profiles.length; i++) { profiles[i].type = "test"; }
            }
        });

    });
};

exports.show = function(req, res, next) {
    var id = req.params.observationId;

    Observation.findOne({ _id: id })
    .populate('user','fullName')
    .populate('organization','name')
    .populate('sharedOrganizations','name')
    .exec(function(err, profile) {
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

        // if admin, allow
        if (req.user.admin) allowed = true;

        if (!allowed) {
            return res.json({ error: "Profile not found" });
        }

        if (!profile) return next(new Error('Failed to load observation ' + id));
        res.json(profile);
    });
};

exports.destroy = function(req, res, next) {
    var id = req.params.observationId;

    Observation.findOne({ _id: id })
    .populate('user','fullName')
    .populate('organization','name')
    .populate('sharedOrganizations','name')
    .exec(function(err, profile) {
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

        // if admin, allow
        if (req.user.admin) allowed = true;

        if (!allowed) {
            return res.json({ error: "Profile not found" });
        }

        if (!profile) return next(new Error('Failed to load observation ' + id));
        
        profile.remove();
    });
};