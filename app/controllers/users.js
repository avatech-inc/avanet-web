/**
 * Module dependencies.
 */
var mongoose = require('mongoose');

var User = mongoose.model('User');
var ForgotPassword = mongoose.model('ForgotPassword');
var Invite = mongoose.model('Invite');
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

// search users
exports.search = function (req, res) {
    // search by full name (starts with <query>)
    // todo: does this need to be .toLowerCase() ?
    var query = { fullName: { $regex: '^' + req.query.query + '', $options: 'i' } };

    // if <query> is an email address, search by email instead of by name
    if (validateEmail(req.query.query)) query = { email_normalized: req.query.query.toLowerCase() };

    // make sure user isn't disabled
    query.disabled = false;

    // make sure user isn't pending
    query.pending = false;

    // make sure user isn't a student
    query.student = false;

    User.find(query).select('fullName')
    .limit(8)
    .exec(function(err, users) {
        res.json(users);
    });
}
function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 


// todo: duplicate of config/routes.js!!!!!!!!!!!!!
var jwt = require('jwt-simple');
var jwt_secret = "guyute";

function saveUser(req, res, user) {

    // normalize email
    if (user.email) {
        user.email_normalized = user.email.toLowerCase();
    }

    user.save(function(err) {
        if (err) {
            return res.json({ success: false, error: "Oops! Something went wrong. Please try again." });
        }
        else {

            // save location
            var request = require("request")
            var query = (user.city + " " + user.state + " " + user.country).replace(/\s{2,}/g, ' ').replace(/ /g,"+");
            var url = "http://api.geonames.org/searchJSON?q=" + query + "&maxRows=2&username=avatech";
            request({ url: url, json: true }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log("JSON:");
                    if (body.geonames && body.geonames.length) {
                        var geoname = body.geonames[0];
                        user.location = [geoname.lng, geoname.lat];
                        user.save();
                    }
                }

                // send welcome email
                Mail.sendTemplate('welcome', 
                    { email: user.email }, 
                    { 'NAME': user.fullName }
                );

                // if hashed org id is specified, user is a student - add to org
                if (req.body.orgHashId) {

                    var orgId = hashids.decodeHex(req.body.orgHashId);
                    if (orgId != "") {

                        Organization.findOne({ _id: orgId })
                        .exec(function(err, org) {
                            
                            var alreadyMember = false;
                            org.members.forEach(function(member){
                                if (member.user.equals(user._id)) alreadyMember = true;
                            });
                            if (!alreadyMember){
                                // add member to org and save
                                org.members.push({ user: user._id, admin: false, student: true });
                                org.save();
                            }

                        });

                   }
                }

                // todo: duplicate of config/routes.js!!!!!!!!!!!!!
                var client_user = {
                    _id: user._id,
                    firstName: "",
                    lastName: "",
                    fullName: user.fullName,
                    admin: user.admin,
                    location: user.location,
                    settings: user.settings,
                    student: user.student,
                    country: user.country
                };

                var payload = { id: user._id };
                var token = jwt.encode(payload, jwt_secret);;
                return res.json({ success: true, token: token, user: client_user });

            });
        }
    });
}
exports.create = function(req, res) {

    var query = {};

    // first check if email already in system or user is pending

    // if hashed user id is specified
    if (req.body.userHashId) {
        var userId = hashids.decodeHex(req.body.userHashId);
        query = { _id: userId };
    }
    // otherwise, search by email
    else query = { email_normalized: req.body.email.toLowerCase() };

    User.findOne(query, function(err, user) {
        if (user) {
            // if user is pending, merge
            if (user.pending) {
                user.fullName = req.body.fullName;
                user.city = req.body.city;
                user.state = req.body.state;
                user.postal = req.body.postal;
                user.country = req.body.country;
                user.password = req.body.password;
                user.pending = false;
                user.created = new Date();
                user.student = false;

                saveUser(req, res, user)
            }
            // otherwise, alert that email is already in system
            else return res.json({ success: false, error: "A user with that email already exists" });
        }
        // create new user
        else {
            var user = new User({
                fullName: req.body.fullName,
                email: req.body.email,

                org: req.body.org,
                jobTitle: req.body.jobTitle,
                profession: req.body.profession,
                city: req.body.city,
                state: req.body.state,
                postal: req.body.postal,
                country: req.body.country,

                password: req.body.password,
                created: new Date(),

                // if hashed org id is specified, user is a student
                student: !!req.body.orgHashId
            });
            saveUser(req, res, user)
        }
    });
};
// update user
exports.updateUser = function(req, res) {
    console.log(req.body);

    // if not admin
    if (!req.user.admin) {
        // user can only update themselves - todo: maybe return 401/403/404?
        if (req.user._id != req.body._id) return res.json({});
        // only an admin can edit these fields
        delete req.body.admin;
        delete req.body.disabled;
        delete req.body.test;
    }

    // remove forbidden fields that can't be edited
    delete req.body.organizations;
    delete req.body.pending;
    delete req.body.hashed_password;
    delete req.body.salt;
    delete req.body.username;
    //delete req.body.email;
    delete req.body.created;
    // remove _id from the model
    delete req.body._id;

    // if email specified, check if email exists
    if (req.body.email) {
        User.findOne({ email_normalized: req.body.email.toLowerCase() }, function(err, emailUser) {
            // if doesn't exist OR email belongs to current user
            if (!emailUser || emailUser._id == req.params.userId) {
                // update
                _save(req.params.userId, req.body);
            }
            else return res.json({ error: "A user with that email already exists" });
        });
    }
    // if no email specified, just save
    else _save(req.params.userId, req.body);

    var _save = function(_id, newUser) {
        console.log("updating user! + " + _id);
        console.log(newUser);

        // normalize email
        if (newUser.email) {
            newUser.email_normalized = newUser.email.toLowerCase();
        }

        User.findOneAndUpdate({ _id: _id }, newUser, { select: '-hashed_password -salt' }, function(err, user) {
            if (err) next(err);
            if (user) res.json(user);
            else res.json({ error: "An error occurred while saving. Please contact support." });
        });
    }

};

exports.forgotPassword = function (req, res) {
    User.findOne({ email_normalized: req.body.email.toLowerCase() }, function(err, user) {
        if (user) {
            // delete existing ForgotPassword
            ForgotPassword.remove({ user: user.id }, function (err) {
                // create ForgotPassword
                var forgotPassword = new ForgotPassword({ user: user.id });
                forgotPassword.save(function(err) {
                    if (err) return next(err);

                    // send forgot password email
                    Mail.sendTemplate('forgot-password', 
                        { email: user.email }, 
                        { 
                            'NAME': user.fullName, 
                            'RESET_LINK': req.protocol + "://" + req.get('host') + '/reset/' +  forgotPassword.id 
                        }
                    );
                });
            });
        }
        res.json({ success: (user != null) });
    });
}

exports.checkForgotPassword = function (req, res) {
    ForgotPassword.findOne({ _id: req.params.forgotPasswordToken }, function(err, forgotPassword) {
        res.json({ ok: !!forgotPassword });
    });
}
exports.resetPassword = function (req, res) {
    ForgotPassword.findOne({ _id: req.body.forgotPasswordToken  }, function(err, forgotPassword) {
        // if token is valid
        if (forgotPassword) {
            // get user
            User.findOne({ _id: forgotPassword.user }, function(err, user) {
                if (user) {
                    // save new password
                    // todo: validate password
                    user.password = req.body.password;
                    user.save(function(err){
                        // delete forgotPassword token
                        forgotPassword.remove(function() {
                            res.json({ success: true });
                        });
                    });
                }
            });
        }
        // if token is invalid
        else res.json({ success: false, error: "invalid token" });
    });
}
exports.changePassword = function (req, res) {
    User.findOne({ _id: req.params.userId }, function(err, user) {
        if (!user) return res.json({ error: "error saving password"});

        if (user.authenticate(req.body.currentPassword)) {
            // save new password
            // todo: validate password
            user.password = req.body.newPassword;
            user.save();
            res.json({ success: true });
        }
        else res.json({ error: "Current password isn't correct, please try again"});
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

exports.show = function(req, res) {
    User.findOne({ _id: req.params.userId })
    .select('-hashed_password -salt -provider')
    .exec(function(err, user) {
        // todo: permissions stuff - only show fields user is allowed to see? (i.e., user can see more for themselves than others can see of them)
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));
        res.json(user);
    });
};

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

    // User.findOne({ _id: req.params.userId })
    //     .select('-hashed_password -salt -provider')
    //     .exec(function(err, user) {
    //         // todo: permissions stuff - only show fields user is allowed to see? (i.e., user can see more for themselves than others can see of them)
    //         if (err) return next(err);
    //         if (!user) return next(new Error('Failed to load User ' + id));

    //         var _user = user.toObject();

    //         res.json(_user);
    //     });
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
