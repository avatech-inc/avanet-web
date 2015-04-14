var mongoose = require('mongoose'),
    Async = require('async'),
    //clone = require('clone'),
    Profile = mongoose.model('Profile'),
    Test = mongoose.model('Test'),
    Observation = mongoose.model('Observation'),
    Organization = mongoose.model('Organization'),
    _ = require('underscore');

// -----------------------------------------------------------------

var util = require('util');

// function objectToString(o) {
//   return Object.prototype.toString.call(o);
// }

// shim for Node's 'util' package
// DO NOT REMOVE THIS! It is required for compatibility with EnderJS (http://enderjs.com/).
// var util = {
//   isArray: function (ar) {
//     return Array.isArray(ar) || (typeof ar === 'object' && objectToString(ar) === '[object Array]');
//   },
//   isDate: function (d) {
//     return typeof d === 'object' && objectToString(d) === '[object Date]';
//   },
//   isRegExp: function (re) {
//     return typeof re === 'object' && objectToString(re) === '[object RegExp]';
//   },
//   getRegExpFlags: function (re) {
//     var flags = '';
//     re.global && (flags += 'g');
//     re.ignoreCase && (flags += 'i');
//     re.multiline && (flags += 'm');
//     return flags;
//   }
// };

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
*/

// function cloneObject(parent, circular, depth, prototype) {
//   // maintain two arrays for circular references, where corresponding parents
//   // and children have the same index
//   var allParents = [];
//   var allChildren = [];

//   var useBuffer = typeof Buffer != 'undefined';

//   if (typeof circular == 'undefined')
//     circular = true;

//   if (typeof depth == 'undefined')
//     depth = Infinity;

//   // recurse this function so we don't reset allParents and allChildren
//   function _cloneObject(parent, depth) {
//     // cloning null always returns null
//     if (parent === null)
//       return null;

//     if (depth == 0)
//       return parent;

//     var child;
//     var proto;
//     if (typeof parent != 'object') {
//       return parent;
//     }

//     if (util.isArray(parent)) {
//       child = [];
//     } else if (util.isRegExp(parent)) {
//       child = new RegExp(parent.source, util.getRegExpFlags(parent));
//       if (parent.lastIndex) child.lastIndex = parent.lastIndex;
//     } else if (util.isDate(parent)) {
//       child = new Date(parent.getTime());
//     } else if (useBuffer && Buffer.isBuffer(parent)) {
//       child = new Buffer(parent.length);
//       parent.copy(child);
//       return child;
//     } else {
//       if (typeof prototype == 'undefined') {
//         proto = Object.getPrototypeOf(parent);
//         child = Object.create(proto);
//       }
//       else {
//         child = Object.create(prototype);
//         proto = prototype;
//       }
//     }

//     if (circular) {
//       var index = allParents.indexOf(parent);

//       if (index != -1) {
//         return allChildren[index];
//       }
//       allParents.push(parent);
//       allChildren.push(child);
//     }

//     for (var i in parent) {
//       var attrs;
//       if (proto) {
//         attrs = Object.getOwnPropertyDescriptor(proto, i);
//       }
      
//       if (attrs && attrs.set == null) {
//         continue;
//       }
//       child[i] = _cloneObject(parent[i], depth - 1);
//     }

//     return child;
//   }

//   return _cloneObject(parent, depth);
// }

// ---------------------------------------

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

            Test.find(query2).
            select('type organization created updated location date user location elevation aspect slope rows_small published sharingLevel') 
            //.sort('-date')
            .populate('user', 'fullName student')
            .populate('organization','name type logoUrl')
            //.lean()
            .exec(function(err, profiles) {
                if (err) callback(err);
                else callback(null, profiles);
            });
        },

        // manual profiles
        function(callback) {

            Profile.find(query).
            select('type organization created updated location date time depth published sharingLevel layers.depth layers.hardness2 layers.hardness layers.height user metaData.location metaData.elevation metaData.date metaData.time metaData.aspect metaData.slope') 
            //.sort('-date')
            .populate('user', 'fullName student')
            .populate('organization','name type logoUrl')
            //.lean()
            .exec(function(err, profiles) {
                if (err) callback(err);
                else callback(null, profiles);
            });
        },

        // avalanches
        function(callback) {

            Observation.find(query)
            .select('type organization created updated location date time locationName user elevation aspect photos slope published sharingLevel') 
            //.sort('-date')
            .populate('user', 'fullName')
            .populate('organization','name type logoUrl')
            //.lean()
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

var compressRows = function(rows) {

    function splitInt(streak) {
        var streak1, streak2, streak3;
        if (streak > 188) {
          streak1 = streak2 = 94;
          streak3 = streak - 188;
        }
        else if (streak > 94) {
          streak1 = 94;
          streak2 = streak - 94;
          streak3 = 0;
        }
        else {
          streak1 = streak;
          streak2 = streak3 = 0;
        }
        return  String.fromCharCode(32 + streak1) +
                String.fromCharCode(32 + streak2);
                //+ String.fromCharCode(32 + streak3);
    }
    function unsplitInt(str) {
        if (str.length != 2) return null; // 3
        return  (str[0].charCodeAt(0) - 32) +
                (str[1].charCodeAt(0) - 32);
                // + (str[2].charCodeAt(0) - 32);
    }

    for (var r = 0; r < rows.length; r++) {
      rows[r] = Math.floor(rows[r] / 2.69) + 32; // 32 is offset for ascii printable chars
    }

    var str = String.fromCharCode.apply(String, rows);
    var chars = [];
    var prev = null;
    var streak = 1;
    for (var s = 0; s < str.length; s++) {
        var ch = str[s];
        if (ch == prev) streak++;
        else if (prev != null) {
            chars.push([prev, streak]);
            streak = 1;
        }
        prev = ch;
    }
    chars.push([prev, streak]);

    var str2 = "";
    for (var c = 0; c < chars.length; c++) {
        var ch = chars[c][0];
        var streak = chars[c][1];
        if (streak > 4) {
            str2 += "\n" + splitInt(streak) + ch; 
        }
        else {
            for (var k = 0; k < streak; k++) str2 += ch;
        };
    }
    return str2;

    // expand
    // var str3 = "";
    // for (var e = 0; e < str2.length; e++) {
    //     var ch = str2[e];
    //     if (ch != "\n") str3 += ch;
    //     else {
    //         var streak = str2.substr(e + 1, 2); //3
    //         streak = unsplitInt(streak);
    //         var _ch = str2[e+3]; //4
    //         for (var k = 0; k < streak; k++) str3 += _ch;
    //         e += 3; //4
    //     }
    // }
}

exports.all = function(req, res) {

    //  Profile.find({})
    // //select('created title location date time depth layers.depth layers.hardness2 layers.hardness layers.height user metaData.location metaData.elevation metaData.date metaData.time metaData.aspect metaData.incline') 
    // //.sort('-created')
    // //.populate('user', 'fullName')
    // .exec(function(err, profiles) {
    //     if (err) {
    //        // res.render('error', { status: 500 });
    //     } else {

    //         for (var i = 0; i < profiles.length; i++) {
    //             var p = profiles[i];

    //             //p.updated = p.created;

    //             //p.save();

    //             //console.log(p.updated)

    //             //if (!p.metaData) p.metaData = {};

    //             // if (p.sharingLevel) {
    //             //     console.log(p.sharingLevel);
    //             //     p.published = true;
    //             //     p.save();
    //             // }

    //             // var elev = p.metaData.elevation;

    //             // if (elev != null && elev != undefined) console.log(elev);

    //             // if ((elev != null || elev != undefined) && typeof elev == 'string' && p.created < new Date('9/24/14')) {


    //             //     var isFeet = null;

    //             //     if (elev == "") elev = null;
    //             //     else if (elev.indexOf("-") == 0) elev = null;
    //             //     else if (elev == "1") elev = null;

    //             //     // // else if (aspect.toLowerCase() == "n") aspect = 0;
    //             //     // // else if (aspect.toLowerCase() == "ne") aspect = 45;
    //             //     // // else if (aspect.toLowerCase() == "ssw") aspect = 202;
    //             //     // // else if (aspect.toLowerCase() == "nw") aspect = 315;
    //             //     // // else if (aspect.toLowerCase() == "se") aspect = 135;
    //             //     // // else if (aspect.toLowerCase() == "sw") aspect = 225;
    //             //     // else if (slope.toLowerCase() == "w") slope = 270;
    //             //     // // else if (aspect.toLowerCase() == "wsw") aspect = 247;
    //             //     // // else if (aspect.toLowerCase() == "ene") aspect = 67;
    //             //     // // else if (aspect.toLowerCase() == "360") aspect = 0;

    //             //     // // else if (aspect == "195 (S)") aspect = 195;
    //             //     // // else if (aspect == "278 W") aspect = 278;

    //             //     else if (elev.toLowerCase().indexOf("ft") != -1) {
    //             //         //elev = elev.substr(0,elev.length-2);
    //             //         isFeet = true;
    //             //     }

    //             //     if (elev != null) elev = elev.replace(/\D/g,'');

    //             //     if (parseInt(elev) > 6800) isFeet = true;


    //             //     if (p.metaData.location) {
    //             //         if (p.metaData.location.toLowerCase().indexOf("cambridge") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("snyderville") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("snyderville") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf(", or") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("heber, ut") != -1) {
    //             //             isFeet = false;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("joachim") != -1) {
    //             //             isFeet = false;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("triple") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("forecaster") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("mores") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("truckee") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("revelstoke") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("revelstoke") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("castle") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("chile") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("nevados") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("furcl") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("abbot") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //         else if (p.metaData.location.toLowerCase().indexOf("cottonwood") != -1) {
    //             //             isFeet = true;
    //             //         }
    //             //     }


    //             //     if (p.metaData.elevation.toLowerCase().indexOf("m") != -1) {
    //             //         isFeet = false;
    //             //     }
    //             //     // //if (aspect != null) aspect = parseInt(aspect);

    //             //     //if (isFeet == null)
    //             //     //    console.log(p.metaData.location + " - " + p.metaData.elevation +","+ elev + "..." + isFeet);

    //             //     if (isFeet == true) {
    //             //         elev = parseInt(elev * 0.3048).toFixed(0);
    //             //     }

    //             //     p.metaData.elevation = elev;
                    
    //             //     //console.log(p.metaData.elevation +","+ elev);
    //             //     //console.log(p.metaData.elevation);
    //             //     // p.metaData.slope = slope;

    //             //     p.markModified('metaData');

    //             //     p.save(function(err){ console.log(err); });
    //             // }
    //             //console.log(p.metaData.slope);

    //             //if (p.metaData.aspect) p.date = p.metaData.date;

    //             // if (!p.date) p.date = p.created;

    //             //console.log(p.date);

    //             //p.save(function(){ console.log("saved!"); });
    //         }
    //         //console.log(profiles.length);

    //         //res.json(profiles);
    //     }
    // });




    
    var e = new Date().getTime();

    // get user's organizations
    Organization.find({})
    .select('members type')
    .exec(function(err, orgs) {
        var _orgs = [];
        var _eduOrgs = [];
        for (var i = 0; i < orgs.length; i++) {
            // is educational org?
            if (orgs[i].type == 'Avalanche education') _eduOrgs.push(orgs[i]._id);

            // is user a member
            for (var m = 0; m < orgs[i].members.length; m++) {
                if (orgs[i].members[m].user.equals(req.user._id)) {
                    _orgs.push(orgs[i]._id); break;
                }
            }
        }

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
            queries.push({ published: true, sharedOrganizations: { '$in': _eduOrgs }, sharingLevel: 'org' });

            // if 'share with students' is selected
            queries.push({ published: true, sharingLevel: 'pros', shareWithStudents: true });

        }
        // if not a student
        else {
            // normal user, only their own data (no drafts)
            queries.push({ published: true, user: req.user });

            // orgs
            queries.push({  published: true, sharedOrganizations: { '$in': _orgs }, sharingLevel: 'org' });

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

        // don't show demo account data (unless user is demo account)
        if (req.user.id != '5416c4bf56a8a90000fba00d') {
            andQueries.push({ user: { '$ne': '5416c4bf56a8a90000fba00d' } });
        }

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

        Async.parallel([

            // SP1 profiles
            function(callback) {
            var d = new Date().getTime();

                var query2 = util._extend({}, query);
                query2['$and'].push({ removed: { "$ne": true } });

                Test.find(query2).
                select('type organization created updated location date user published location elevation aspect slope rows_small') 
                //.sort('-date')
                .populate('user', 'fullName student')
                .populate('organization','name type logoUrl')
                .lean()
                .exec(function(err, obs) {
                    console.log("TIME S: " + (new Date().getTime() - d) + " ms");
                    if (err) callback(err);
                    else  {
                        for (var i = 0; i < obs.length; i++) {
                            var rows = obs[i].rows_small;
                            obs[i].rows_tiny = compressRows(rows);
                            delete obs[i].rows_small;
                        }
                        callback(null, obs);
                    }
                });
            },

            // manual profiles
            function(callback) {
            var d = new Date().getTime();

                Profile.find(query).
                select('type organization created updated location date time depth published sharingLevel layers.depth layers.hardness2 layers.hardness layers.height user metaData.location metaData.elevation metaData.date metaData.time metaData.aspect metaData.slope') 
                //.sort('-date')
                .populate('user', 'fullName student')
                .populate('organization','name type logoUrl')
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

                Observation.find(query)
                .select('type organization created updated location date time published locationName user elevation aspect photos slope') 
                //.sort('-date')
                .populate('user', 'fullName')
                .populate('organization','name type logoUrl')
                .lean()
                .exec(function(err, obs) {
                    console.log("TIME A: " + (new Date().getTime() - d) + " ms");
                    if (err) callback(err);
                    else callback(null, obs);
                });
            }
        ],
        function(err, results) {

            var d = new Date().getTime();

            var _results = [];
            // combine SP1 profiles 
            _results = _results.concat(results[0]);
            // combine manual profiles - published
            _results = _results.concat(results[1]);
            // combine avalanches
            _results = _results.concat(results[2]);

            console.log("TOTAL ITEMS: " + _results.length);
            console.log("TIME: " + (new Date().getTime() - d) + " ms");

            if (err) res.render('error', { status: 500 });
            else res.json(_results);
        });
    
    });
};