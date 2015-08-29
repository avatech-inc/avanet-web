/**
 * Module dependencies.
 */
var mongoose = require('mongoose');

var User = mongoose.model('User');
var Organization = mongoose.model('Organization');
var Hashids = require("hashids"), hashids = new Hashids("isaidnosalt");

var Mail = require('../../config/mail');

var Async = require('async');

// get all users
exports.getAll = function (req, res) {
    User.find({ pending: false }, '-hashed_password -salt -provider -organizations', function(err, users) {
        res.json(users);
    });
}
exports.getPending = function (req, res) {
    // decode hashed user id
    var userId = hashids.decodeHex(req.params.userHashId);

    User.findOne({ _id: userId, pending: true }, function(err, user) {
        if (user) res.json({ ok: true });
        else res.json({ ok: false })
    });
}
exports.getUserStats = function(req, res) {

    var Test = mongoose.model('Test');
    var Profile = mongoose.model('Profile');
    var Observation = mongoose.model('Observation');
    var Organization = mongoose.model('Organization');
    var Comment = mongoose.model('Comment');

    Async.parallel([

        function(callback) {
            Test.find({ user: req.params.userId }).select('_id').exec(function(err, items){
                callback(null, items != null ? items.length : 0);
            });
        },
        function(callback) {
            Profile.find({ user: req.params.userId }).select('_id').exec(function(err, items){
                callback(null, items != null ? items.length : 0);
            });
        },
        function(callback) {
            Observation.find({ user: req.params.userId }).select('_id').exec(function(err, items){
                callback(null, items != null ? items.length : 0);
            });
        },
        function(callback) {
            Organization.find({ members: {"$elemMatch": { user: req.params.userId } } }).select('_id').exec(function(err, items){
                callback(null, items != null ? items.length : 0);
            });
        },
        function(callback) {
            Comment.find({ user: req.params.userId }).select('_id').exec(function(err, items){
                callback(null, items != null ? items.length : 0);
            });
        },

    ],

    function(err, results) {

        var counts = {
            tests: results[0],
            profiles: results[1],
            obs: results[2],
            orgs: results[3],
            comments: results[4]
        }
        res.json(counts);
    });
}

// todo: where is this used?
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};
