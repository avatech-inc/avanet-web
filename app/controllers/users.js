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
