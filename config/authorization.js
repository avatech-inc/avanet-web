var mongoose = require('mongoose');
var User = mongoose.model('User');

var jwt = require('jwt-simple');
var jwt_secret = "guyute";

exports.requireLogin = function(req, res, next) {
    // first, check http header
    var authToken = req.headers['auth-token'];
    // if not there, check form body
    if (!authToken) authToken = req.body.authToken;
    //console.log("authToken:");
    //console.log(authToken);
    // decode the token
    if(authToken) {
        var decoded = jwt.decode(authToken, jwt_secret);
        // if user exists, store it in 'req.user'
        User.findOne({ _id: decoded.id }, function (err, user) {
          if (user) {
            req.user = user;
            return next();
          }
          else return res.redirect('/');
        });
    }
    else return res.redirect('/');
};
exports.requireAdmin = function(req, res, next) {
    console.log("REQUIRE ADMIN!");
    console.log(req.user);
    if (req.user && req.user.admin) next();
    else {
        console.log("Admin only. 404.");
        res.redirect('/');
        //res.status(404).sendfile('./app/views/404.html');
    }
};