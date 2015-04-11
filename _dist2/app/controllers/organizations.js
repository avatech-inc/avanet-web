/**
 * Module dependencies.
 */
var mongoose = require('mongoose');

var Organization = mongoose.model('Organization');
var ForgotPassword = mongoose.model('ForgotPassword');
var Invite = mongoose.model('Invite');
var User = mongoose.model('User');

var Mail = require('../../config/mail');

var Hashids = require("hashids"), hashids = new Hashids("isaidnosalt");


// get all users
exports.getAll = function (req, res) {
    Organization.find({ }, '', function(err, orgs) {
        res.json(orgs);
    });
}

exports.create = function(req, res) {
    // remove forbidden fields
    delete req.body.members;
    delete req.body.created;

    // check if org with this name exists
    var query = { name: { $regex: '^' + req.body.name.toLowerCase() + '', $options: 'i' } };
    Organization.findOne(query).exec(function(err, org) {
        console.log("ORG:");

        // org with this name already exists
        if (org) {
            console.log("ORG EXISTS!");
            return res.json({ success: false, error: "An organization with this name already exists." });
        }
        // otherwise, create org
        else {
            var org = new Organization(req.body);

            org.members.push({
                user: req.user,
                admin: true
            });

            org.save(function(err, newOrg){  
                if (err) res.json({ success: false });
                else res.json(newOrg);
            });
        }
    });
    
};

exports.showEducation = function(req, res) {
   var orgId = hashids.decodeHex(req.params.orgHashId);

   // if invalid orgHashId
   if (orgId == "") return res.json({ ok: false, error: "invalid org hash id" });

   Organization.findOne({ _id: orgId })
   .select('name type logo')
    .exec(function(err, org) {
        if (err || !org) return res.json({ ok: false, error: err });
        org = org.toObject();
        org.ok = !!org;

        res.json(org);
    });
};

exports.show = function(req, res) {
   Organization.findOne({ _id: req.params.orgId })
   .select('-members')
    .exec(function(err, org) {
        if (err) return next(err);
        //if (!org) return next(new Error('Failed to load profile ' + id));

        // if user isn't an org member, don't allow
        // var isMember = false;
        // for (var i = 0; i < org.members.length; i++) {
        //     if (org.members[i].user.equals(req.user._id) && !org.members[i].student) isMember = true;
        // }
        // if (!isMember) next(null);

        // add hashedId to org object
        org = org.toObject();
        org.hashedId = hashids.encodeHex(org._id);

        res.json(org);
    });
};

exports.update = function(req, res) {
    // remove forbidden fields
    delete req.body.members;
    delete req.body.created;

    // remove _id from the model
    delete req.body._id;
    // update
    Organization.findOneAndUpdate({ _id: req.params.orgId }, req.body, { select: '-members' }, function(err, org) {
        if (err) next(err);
        if (org) res.json(org);
        else res.json({});
    });
};

exports.members_update = function(req, res) {
    Organization.findOne({ _id: req.params.orgId }).exec(function(err, org) {
        if (err) next(err);

        // if user isn't an org admin, throw an error
        var isAdmin = false;
        for (var i = 0; i < org.members.length; i++) {
            if (org.members[i].user.equals(req.user._id) && org.members[i].admin) isAdmin = true;
        }
        // if user is AvaNet admin, allowed
        if (req.user.admin) isAdmin = true;
        if (!isAdmin) next(null);

        // save 
        var member = org.members.id(req.params.memberId);
        if (member) {
            member.admin = req.body.admin;
            org.save();
        }
        res.json({ success: true });
    });
};
// the fields that will be selected when the member's user ref is populate
// (i.e., we'll add photo here once we have that)
var populateUserSelect = 'fullName pending student';
exports.members_all = function(req, res) {
   Organization.findOne({ _id: req.params.orgId })
    //.select('members admin')
    .populate('members.user', populateUserSelect)
    .exec(function(err, org) {
        if (err || !org) return next(err);

        // user must be a member
        var isMember = false;
        for (var i = 0; i < org.members.length; i++) {
            if (org.members[i].user._id.equals(req.user._id) && !org.members[i].user.student) isMember = true;
        }
        // if user is AvaNet admin, allowed
        if (req.user.admin) isMember = true;
        if (!isMember) return res.json([]);

        //if (!org) return next(new Error('Failed to load profile ' + id));
        res.json(org.members);
    });
};

// ---------

function createOrSelectByEmail(req, orgName, email, callback) {
    // make sure email doesn't already exist as user
    // if it does, return (doesn't matter if regular or pending)
    User.findOne({ email: email }, function(err, user) {
        if (err) callback(null);
        // if user exists, return it
        if (user) callback(user);
        // if user doesn't exist, create it, then return
        else {
            // todo: move user creation to the users controller

            user = new User({
                fullName: email,
                email: email,
                password: null,
                pending: true,
                created: new Date()
            });

            user.save(function(err, _user) {
                if (err) callback(null);
                else {
                    // user created!
                    callback(_user);

                    // create id hash
                    var Hashids = require("hashids"),
                    hashids = new Hashids("isaidnosalt");
                    var userIdHash = hashids.encodeHex(user._id);
                    
                    // send invite email
                    Mail.sendTemplate('invite', 
                        { email: _user.email }, 
                        { 'REGISTER_LINK': req.protocol + "://" + req.get('host') + '/register/' +  userIdHash,
                            'ORG_NAME': orgName }
                    );
                }
            });
        }
    });
}
function addMemberByUser(res, userId, org) {
    // if user is already a member, return error
    var alreadyMember = false;
    org.members.forEach(function(member){
        if (member.user.equals(userId)) alreadyMember = true;
    });
    if (alreadyMember) return res.json({ success: false, error: "alreadymember" })

    // add org to user and save
    // todo...

    // add member to org and save
    org.members.push({ user: userId, admin: false });
    org.save(function(err, _org) {
        if (err) res.json({ success: false, error: "save error" });
        else {
            // return org member
            _org.members.forEach(function(member){
                if (member.user.equals(userId)) {
                    // populate user
                    User.populate(member, { path: 'user', select: populateUserSelect }, function(err, _member) {
                        if (err) res.json({ success: false, error: "save error" });
                        else res.json(_member);
                    });                   
                }
            });
        }
    });
}

exports.members_add = function(req, res) {
    Organization.findOne({ _id: req.params.orgId }).exec(function(err, org) {
        if (err) next(err);

        // if user isn't an org admin, throw an error
        var isAdmin = false;
        for (var i = 0; i < org.members.length; i++) {
            if (org.members[i].user.equals(req.user._id) && org.members[i].admin) isAdmin = true;
        }
        // if user is AvaNet admin, allowed
        if (req.user.admin) isAdmin = true;
        if (!isAdmin) next(err);

        // check if email
        if (req.body.email) {
            createOrSelectByEmail(req, org.name, req.body.email, function(newUser) {
                if (!newUser) res.json({ success: false, error: "save error" });
                else addMemberByUser(res, newUser._id, org);
            });
        }
        // if user
        else if (req.body.user) {
            addMemberByUser(res, req.body.user, org);
        }
    });
};
exports.members_remove = function(req, res) {
    Organization.findOne({ _id: req.params.orgId }).exec(function(err, org) {
        if (err) next(err);

        // if user isn't an org admin, throw an error
        var isAdmin = false;
        for (var i = 0; i < org.members.length; i++) {
            if (org.members[i].user.equals(req.user._id) && org.members[i].admin) isAdmin = true;
        }
        // if user is AvaNet admin, allowed
        if (req.user.admin) isAdmin = true;
        if (!isAdmin) next(err);
        
        org.members.id(req.params.memberId).remove();
        org.save();
        res.json({ success: true });
    });
};

exports.getUserOrgs = function(req, res) {
    Organization.find({}).exec(function(err, orgs) {
        var _orgs = [];
        for (var i = 0; i < orgs.length; i++) {
            // is user a member
            for (var m = 0; m < orgs[i].members.length; m++) {
                if (orgs[i].members[m].user.equals(req.user._id))
                    _orgs.push({ 
                        _id: orgs[i]._id,
                        name: orgs[i].name,
                        type: orgs[i].type,
                        logoUrl: orgs[i].logoUrl
                    });
            }
        }
        res.json(_orgs);
    });
}

// search users
exports.search = function (req, res) {
    // search by name (starts with <query>)
    var query = { name: { $regex: '^' + req.query.query + '', $options: 'i' } };

    // todo: exlcude orgs that user is already member of

    // make sure org isn't disabled
    //query.disabled = false;

    // make sure org isn't hidden
    //query.hidden = false;

    Organization.find(query)
    .select('name type')
    .limit(4)
    .exec(function(err, users) {
        res.json(users);
    });
}