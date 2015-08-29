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