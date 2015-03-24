var mongoose = require('mongoose'),
    async = require('async'),
    FieldTest = mongoose.model('FieldTest'),
    _ = require('underscore');

exports.create = function(req, res) {
    var fieldTest = new FieldTest(req.body);

    fieldTest.user = req.user;
    fieldTest.save(function(){
        res.jsonp(fieldTest);
    });
};

exports.update = function(req, res) {
    // // var profile = req.profile;

    // // profile = _.extend(profile, req.body);

    // // profile.save(function(err) {
    // //     res.jsonp(profile);
    // // });




    // // if not admin
    // // if (!req.user.admin) {
    // //     // user can only update themself - todo: maybe return 401/403?
    // //     if (req.user._id != req.body._id) return res.json({});
    // //     // remove forbidden fields
    // //     delete req.body.admin;
    // //     delete req.body.disabled;
    // // }
    // // remove forbidden fields
    // //delete req.body.hashed_password;
    // // delete req.body.salt;
    // // delete req.body.username;
    // // delete req.body.email;
    // delete req.body.user;
    // // remove _id from the model
    // delete req.body._id;
    // // update
    // Profile.findOneAndUpdate({ _id: req.params.profileId }, req.body, { select: '-user' }, function(err, profile) {
    //     if (err) console.log(err);
    //     if (profile) res.json(profile);
    //     else res.json({});
    // });
};

exports.destroy = function(req, res) {
    // var profile = req.profile;

    // profile.remove(function(err) {
    //     if (err) {
    //         res.render('error', {
    //             status: 500
    //         });
    //     } else {
    //         res.jsonp(profile);
    //     }
    // });
};

exports.show = function(req, res) {
    var id = req.params.fieldTestId;

    var tests = ""; for (var i = 1; i <= 18; i++) {  tests += " test" + i; }

    FieldTest.findOne({ _id: id })
    .populate('profile', '')
    .populate(tests, 'rows_small hash title')
    .populate('user', 'fullName')
    .exec(function(err, profile) {
        if (err) return next(err);
        if (!profile) return next(new Error('Failed to load profile ' + id));
        res.jsonp(profile);
    });
};

exports.all = function(req, res) {
    var select = { user: req.user };
    if (req.user.admin) select = {};
    FieldTest.find(select).select('').sort('-created')
    .populate('user', 'fullName')
    .populate('profile')
    .exec(function(err, profiles) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(profiles);
        }
    });
};