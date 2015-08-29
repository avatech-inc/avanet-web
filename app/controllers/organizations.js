/**
 * Module dependencies.
 */
var mongoose = require('mongoose');

var Organization = mongoose.model('Organization');
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