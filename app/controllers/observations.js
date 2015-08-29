var mongoose = require('mongoose'),
    Async = require('async'),
    Test = mongoose.model('Test'),
    Observation = mongoose.model('Observation'),
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